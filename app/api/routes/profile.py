import os
from flask import Blueprint, request, jsonify, current_app
from app.api.models.user import User
from app.api.middlewares.auth_middleware import token_required, requires_verification
from werkzeug.utils import secure_filename
import validators

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get the current user's profile"""
    return jsonify({
        "status": True,
        "profile": {
            "id": current_user._id,
            "username": current_user.username,
            "email": current_user.email,
            "phone": current_user.phone,
            "user_type": current_user.user_type,
            "profile_picture": current_user.profile_picture,
            "bio": current_user.bio,
            "social_links": current_user.social_links,
            "onboarding_responses": current_user.onboarding_responses,
            "email_verified": current_user.email_verified,
            "phone_verified": current_user.phone_verified,
            "is_open_to_more": current_user.is_open_to_more
        }
    }), 200

@profile_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user_profile(current_user, user_id):
    """Get another user's profile"""
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"status": False, "message": "User not found"}), 404
    
    return jsonify({
        "status": True,
        "profile": {
            "id": user._id,
            "username": user.username,
            "user_type": user.user_type,
            "profile_picture": user.profile_picture,
            "bio": user.bio,
            "social_links": user.social_links,
            "is_open_to_more": user.is_open_to_more,
            "is_favorited": user._id in current_user.favorites['users']
        }
    }), 200

@profile_bp.route('/onboarding', methods=['POST'])
@token_required
def update_onboarding(current_user):
    """Update user's onboarding responses"""
    data = request.get_json()
    
    if 'responses' not in data:
        return jsonify({"status": False, "message": "Responses are required"}), 400
    
    responses = data['responses']
    
    if not isinstance(responses, dict):
        return jsonify({"status": False, "message": "Responses must be an object"}), 400
    
    # Update onboarding responses
    current_user.onboarding_responses = responses
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": "Onboarding responses updated successfully"
    }), 200

@profile_bp.route('/update', methods=['PUT'])
@token_required
@requires_verification
def update_profile(current_user):
    """Update user's profile"""
    data = request.get_json()
    
    # Fields that can be updated
    allowed_fields = ['username', 'bio', 'social_links']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            # Validate social links if provided
            if field == 'social_links' and data[field]:
                if not isinstance(data[field], dict):
                    return jsonify({
                        "status": False,
                        "message": "Social links must be an object with platform names as keys and URLs as values"
                    }), 400
                
                # Validate URLs
                for platform, url in data[field].items():
                    if not validators.url(url):
                        return jsonify({
                            "status": False,
                            "message": f"Invalid URL for {platform}"
                        }), 400
            
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({
            "status": False,
            "message": "No valid fields to update"
        }), 400
    
    # Update user profile
    current_user.update(update_data)
    
    return jsonify({
        "status": True,
        "message": "Profile updated successfully",
        "profile": {
            "id": current_user._id,
            "username": current_user.username,
            "bio": current_user.bio,
            "social_links": current_user.social_links
        }
    }), 200

@profile_bp.route('/profile-picture', methods=['POST'])
@token_required
@requires_verification
def update_profile_picture(current_user):
    """Update user's profile picture"""
    if 'file' not in request.files:
        return jsonify({"status": False, "message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": False, "message": "No file selected"}), 400
    
    if file:
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({"status": False, "message": "Invalid file type. Allowed types: png, jpg, jpeg, gif"}), 400
        
        # Create a secure filename
        filename = secure_filename(f"{current_user._id}_{file.filename}")
        
        # Save file
        profile_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profiles')
        file_path = os.path.join(profile_dir, filename)
        file.save(file_path)
        
        # Update user's profile_picture field
        current_user.profile_picture = f"/profiles/{filename}"
        current_user.save()
        
        return jsonify({
            "status": True,
            "message": "Profile picture updated successfully",
            "profile_picture": current_user.profile_picture
        }), 200
    
    return jsonify({"status": False, "message": "Failed to upload profile picture"}), 400

@profile_bp.route('/favorite/<user_id>', methods=['POST'])
@token_required
@requires_verification
def favorite_user(current_user, user_id):
    """Add/remove a user to/from favorites"""
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"status": False, "message": "User not found"}), 404
    
    # Check if trying to favorite yourself
    if user_id == current_user._id:
        return jsonify({"status": False, "message": "Cannot favorite yourself"}), 400
    
    # Toggle favorite
    if user_id in current_user.favorites['users']:
        current_user.favorites['users'].remove(user_id)
        action = "removed from"
    else:
        current_user.favorites['users'].append(user_id)
        action = "added to"
    
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": f"User {action} favorites",
        "is_favorited": user_id in current_user.favorites['users']
    }), 200

@profile_bp.route('/favorites/users', methods=['GET'])
@token_required
@requires_verification
def get_favorite_users(current_user):
    """Get user's favorite users"""
    favorite_users = []
    
    for user_id in current_user.favorites['users']:
        user = User.find_by_id(user_id)
        if user:
            favorite_users.append({
                "id": user._id,
                "username": user.username,
                "user_type": user.user_type,
                "profile_picture": user.profile_picture,
                "bio": user.bio
            })
    
    return jsonify({
        "status": True,
        "favorites": favorite_users
    }), 200

@profile_bp.route('/collaboration-request/<user_id>', methods=['POST'])
@token_required
@requires_verification
def send_collaboration_request(current_user, user_id):
    """Send a collaboration request to another user"""
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"status": False, "message": "User not found"}), 404
    
    # Check if trying to send a request to yourself
    if user_id == current_user._id:
        return jsonify({"status": False, "message": "Cannot send a collaboration request to yourself"}), 400
    
    data = request.get_json() or {}
    message = data.get('message', 'I would like to collaborate with you')
    
    # Create a conversation for the collaboration request
    from app.api.models.message import Message
    
    conversation_id = Message.generate_conversation_id(current_user._id, user_id, "collaboration")
    
    # Create and save the message
    message_obj = Message(
        sender_id=current_user._id,
        receiver_id=user_id,
        conversation_id=conversation_id,
        content=message,
        message_type="collaboration"
    )
    message_obj.save()
    
    return jsonify({
        "status": True,
        "message": "Collaboration request sent successfully",
        "conversation_id": conversation_id
    }), 200

@profile_bp.route('/project-proposal/<user_id>', methods=['POST'])
@token_required
@requires_verification
def send_project_proposal(current_user, user_id):
    """Send a project proposal to another user"""
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"status": False, "message": "User not found"}), 404
    
    # Check if trying to send a proposal to yourself
    if user_id == current_user._id:
        return jsonify({"status": False, "message": "Cannot send a project proposal to yourself"}), 400
    
    data = request.get_json()
    
    if not data or 'title' not in data or 'description' not in data:
        return jsonify({"status": False, "message": "Title and description are required"}), 400
    
    # Create a conversation for the project proposal
    from app.api.models.message import Message
    
    conversation_id = Message.generate_conversation_id(current_user._id, user_id, "proposal")
    
    # Create message content
    content = f"PROJECT PROPOSAL\nTitle: {data['title']}\nDescription: {data['description']}"
    
    if 'budget' in data:
        content += f"\nBudget: {data['budget']}"
    
    # Create and save the message
    message_obj = Message(
        sender_id=current_user._id,
        receiver_id=user_id,
        conversation_id=conversation_id,
        content=content,
        message_type="proposal"
    )
    message_obj.save()
    
    return jsonify({
        "status": True,
        "message": "Project proposal sent successfully",
        "conversation_id": conversation_id
    }), 200 