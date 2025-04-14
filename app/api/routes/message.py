from flask import Blueprint, request, jsonify
from app.api.models.message import Message
from app.api.models.user import User
from app.api.middlewares.auth_middleware import token_required, requires_verification

message_bp = Blueprint('message', __name__)

@message_bp.route('/conversations', methods=['GET'])
@token_required
@requires_verification
def get_conversations(current_user):
    """Get all conversations for the current user"""
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 20, type=int), 50)  # Maximum 50 per page
    skip = (page - 1) * limit
    
    # Get conversations
    conversations = Message.find_by_user(current_user._id, skip, limit)
    
    # Format response
    formatted_conversations = []
    for conversation in conversations:
        conversation_id = conversation["conversation_id"]
        latest_message = conversation["latest_message"]
        
        # Determine the other user in the conversation
        other_user_id = latest_message.sender_id if latest_message.sender_id != current_user._id else latest_message.receiver_id
        other_user = User.find_by_id(other_user_id)
        
        if other_user:
            formatted_conversations.append({
                "conversation_id": conversation_id,
                "other_user": {
                    "id": other_user._id,
                    "username": other_user.username,
                    "profile_picture": other_user.profile_picture
                },
                "latest_message": {
                    "id": latest_message._id,
                    "content": latest_message.content,
                    "sender_id": latest_message.sender_id,
                    "is_read": latest_message.is_read,
                    "message_type": latest_message.message_type,
                    "created_at": latest_message.created_at
                }
            })
    
    # Get unread count
    unread_count = Message.get_unread_count(current_user._id)
    
    return jsonify({
        "status": True,
        "conversations": formatted_conversations,
        "unread_count": unread_count,
        "page": page,
        "limit": limit
    }), 200

@message_bp.route('/conversations/<conversation_id>', methods=['GET'])
@token_required
@requires_verification
def get_conversation_messages(current_user, conversation_id):
    """Get messages for a specific conversation"""
    # Check if user is part of the conversation
    sample_message = Message.find_by_conversation(conversation_id, 0, 1)
    
    if not sample_message:
        return jsonify({"status": False, "message": "Conversation not found"}), 404
    
    is_participant = False
    other_user_id = None
    
    for msg in sample_message:
        if msg.sender_id == current_user._id or msg.receiver_id == current_user._id:
            is_participant = True
            other_user_id = msg.sender_id if msg.sender_id != current_user._id else msg.receiver_id
            break
    
    if not is_participant:
        return jsonify({"status": False, "message": "You are not a participant in this conversation"}), 403
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 50, type=int), 100)  # Maximum 100 per page
    skip = (page - 1) * limit
    
    # Get messages
    messages = Message.find_by_conversation(conversation_id, skip, limit)
    
    # Mark messages as read
    Message.mark_conversation_as_read(conversation_id, current_user._id)
    
    # Get other user information
    other_user = User.find_by_id(other_user_id) if other_user_id else None
    
    # Format response
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "id": msg._id,
            "sender_id": msg.sender_id,
            "content": msg.content,
            "is_read": msg.is_read,
            "message_type": msg.message_type,
            "created_at": msg.created_at
        })
    
    return jsonify({
        "status": True,
        "conversation_id": conversation_id,
        "messages": formatted_messages,
        "other_user": {
            "id": other_user._id,
            "username": other_user.username,
            "profile_picture": other_user.profile_picture,
            "user_type": other_user.user_type
        } if other_user else None,
        "page": page,
        "limit": limit
    }), 200

@message_bp.route('/send/<user_id>', methods=['POST'])
@token_required
@requires_verification
def send_message(current_user, user_id):
    """Send a message to another user"""
    # Check if user exists
    recipient = User.find_by_id(user_id)
    
    if not recipient:
        return jsonify({"status": False, "message": "Recipient not found"}), 404
    
    # Check if trying to send a message to yourself
    if user_id == current_user._id:
        return jsonify({"status": False, "message": "Cannot send a message to yourself"}), 400
    
    data = request.get_json()
    
    if 'content' not in data or not data['content'].strip():
        return jsonify({"status": False, "message": "Message content is required"}), 400
    
    # Check if context is provided for specialized conversation
    context = data.get('context')
    
    # Generate conversation ID
    conversation_id = Message.generate_conversation_id(current_user._id, user_id, context)
    
    # Create message
    message = Message(
        sender_id=current_user._id,
        receiver_id=user_id,
        conversation_id=conversation_id,
        content=data['content'],
        message_type=data.get('message_type', 'personal')
    )
    
    # Save message
    message_id = message.save()
    
    return jsonify({
        "status": True,
        "message": "Message sent successfully",
        "message_id": message_id,
        "conversation_id": conversation_id
    }), 201

@message_bp.route('/unread/count', methods=['GET'])
@token_required
@requires_verification
def get_unread_count(current_user):
    """Get count of unread messages"""
    count = Message.get_unread_count(current_user._id)
    
    return jsonify({
        "status": True,
        "unread_count": count
    }), 200

@message_bp.route('/mark-read/<message_id>', methods=['POST'])
@token_required
@requires_verification
def mark_message_as_read(current_user, message_id):
    """Mark a specific message as read"""
    message = Message.find_by_id(message_id)
    
    if not message:
        return jsonify({"status": False, "message": "Message not found"}), 404
    
    # Check if user is the recipient
    if message.receiver_id != current_user._id:
        return jsonify({"status": False, "message": "You can only mark messages sent to you as read"}), 403
    
    # Mark as read
    message.mark_as_read()
    
    return jsonify({
        "status": True,
        "message": "Message marked as read"
    }), 200

@message_bp.route('/mark-conversation-read/<conversation_id>', methods=['POST'])
@token_required
@requires_verification
def mark_conversation_as_read(current_user, conversation_id):
    """Mark all messages in a conversation as read"""
    # Check if user is part of the conversation
    sample_message = Message.find_by_conversation(conversation_id, 0, 1)
    
    if not sample_message:
        return jsonify({"status": False, "message": "Conversation not found"}), 404
    
    is_participant = False
    
    for msg in sample_message:
        if msg.sender_id == current_user._id or msg.receiver_id == current_user._id:
            is_participant = True
            break
    
    if not is_participant:
        return jsonify({"status": False, "message": "You are not a participant in this conversation"}), 403
    
    # Mark conversation as read
    count = Message.mark_conversation_as_read(conversation_id, current_user._id)
    
    return jsonify({
        "status": True,
        "message": f"{count} messages marked as read"
    }), 200 