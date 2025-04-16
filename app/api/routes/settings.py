from flask import Blueprint, request, jsonify
from app.api.models.user import User
from app.api.models.verification import VerificationCode
from app.api.middlewares.auth_middleware import token_required, requires_verification
from app.api.services.auth_service import AuthService
import validators

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@token_required
def get_settings(current_user):
    """Get user's settings"""
    # Default settings if not set
    settings = {
        "notifications": {
            "email_notifications": True,
            "push_notifications": True,
            "message_notifications": True,
            "collaboration_notifications": True
        },
        "privacy": {
            "show_email": False,
            "show_phone": False,
            "show_projects": True,
            "allow_messages_from": "everyone",
            "profile_visibility": "public"
        },
        "theme": {
            "mode": "light",
            "color": "blue",
            "font_size": "medium"
        }
    }
    
    # Merge with user's settings if they exist
    if hasattr(current_user, 'settings'):
        if current_user.settings.get('notifications'):
            settings['notifications'].update(current_user.settings.get('notifications', {}))
        if current_user.settings.get('privacy'):
            settings['privacy'].update(current_user.settings.get('privacy', {}))
        if current_user.settings.get('theme'):
            settings['theme'].update(current_user.settings.get('theme', {}))
    
    return jsonify({
        "status": True,
        "settings": settings
    }), 200

@settings_bp.route('/notifications', methods=['PUT'])
@token_required
def update_notification_settings(current_user):
    """Update user's notification settings"""
    data = request.get_json()
    
    valid_notification_settings = [
        "email_notifications",
        "push_notifications", 
        "message_notifications",
        "collaboration_notifications"
    ]
    
    # Validate notification settings
    for key in data:
        if key not in valid_notification_settings:
            return jsonify({
                "status": False,
                "message": f"Invalid notification setting: {key}"
            }), 400
        if not isinstance(data[key], bool):
            return jsonify({
                "status": False,
                "message": f"Value for {key} must be a boolean"
            }), 400
    
    # Initialize settings if not exist
    if not hasattr(current_user, 'settings'):
        current_user.settings = {}
    if 'notifications' not in current_user.settings:
        current_user.settings['notifications'] = {}
    
    # Update notification settings
    current_user.settings['notifications'].update(data)
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": "Notification settings updated successfully",
        "notifications": current_user.settings['notifications']
    }), 200

@settings_bp.route('/privacy', methods=['PUT'])
@token_required
def update_privacy_settings(current_user):
    """Update user's privacy settings"""
    data = request.get_json()
    
    valid_privacy_settings = {
        "show_email": bool,
        "show_phone": bool,
        "show_projects": bool,
        "allow_messages_from": ["everyone", "connections_only", "none"],
        "profile_visibility": ["public", "connections_only", "private"]
    }
    
    # Validate privacy settings
    for key, value in data.items():
        if key not in valid_privacy_settings:
            return jsonify({
                "status": False,
                "message": f"Invalid privacy setting: {key}"
            }), 400
        
        if isinstance(valid_privacy_settings[key], list):
            if value not in valid_privacy_settings[key]:
                return jsonify({
                    "status": False,
                    "message": f"Invalid value for {key}. Valid values are: {', '.join(valid_privacy_settings[key])}"
                }), 400
        elif not isinstance(value, valid_privacy_settings[key]):
            return jsonify({
                "status": False,
                "message": f"Value for {key} must be a {valid_privacy_settings[key].__name__}"
            }), 400
    
    # Initialize settings if not exist
    if not hasattr(current_user, 'settings'):
        current_user.settings = {}
    if 'privacy' not in current_user.settings:
        current_user.settings['privacy'] = {}
    
    # Update privacy settings
    current_user.settings['privacy'].update(data)
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": "Privacy settings updated successfully",
        "privacy": current_user.settings['privacy']
    }), 200

@settings_bp.route('/theme', methods=['PUT'])
@token_required
def update_theme_settings(current_user):
    """Update user's theme settings"""
    data = request.get_json()
    
    valid_theme_settings = {
        "mode": ["light", "dark"],
        "color": ["blue", "green", "purple", "red", "orange"],
        "font_size": ["small", "medium", "large"]
    }
    
    # Validate theme settings
    for key, value in data.items():
        if key not in valid_theme_settings:
            return jsonify({
                "status": False,
                "message": f"Invalid theme setting: {key}"
            }), 400
        
        if value not in valid_theme_settings[key]:
            return jsonify({
                "status": False,
                "message": f"Invalid value for {key}. Valid values are: {', '.join(valid_theme_settings[key])}"
            }), 400
    
    # Initialize settings if not exist
    if not hasattr(current_user, 'settings'):
        current_user.settings = {}
    if 'theme' not in current_user.settings:
        current_user.settings['theme'] = {}
    
    # Update theme settings
    current_user.settings['theme'].update(data)
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": "Theme settings updated successfully",
        "theme": current_user.settings['theme']
    }), 200

@settings_bp.route('/public/<user_id>', methods=['GET'])
@token_required
def get_public_settings(current_user, user_id):
    """Get public settings for another user"""
    # Find user by ID
    target_user = User.find_by_id(user_id)
    
    if not target_user:
        return jsonify({
            "status": False,
            "message": "User not found"
        }), 404
    
    # Get privacy settings
    privacy_settings = {}
    if hasattr(target_user, 'settings') and 'privacy' in target_user.settings:
        privacy_settings = target_user.settings['privacy']
    else:
        # Default privacy settings
        privacy_settings = {
            "show_email": False,
            "show_phone": False,
            "show_projects": True,
            "allow_messages_from": "everyone",
            "profile_visibility": "public"
        }
    
    # Only return public settings
    public_settings = {
        "allow_messages_from": privacy_settings.get("allow_messages_from", "everyone"),
        "profile_visibility": privacy_settings.get("profile_visibility", "public"),
        "show_projects": privacy_settings.get("show_projects", True)
    }
    
    return jsonify({
        "status": True,
        "settings": public_settings
    }), 200

@settings_bp.route('/email', methods=['PUT'])
@token_required
@requires_verification
def update_email(current_user):
    """Update user's email"""
    data = request.get_json()
    
    if 'email' not in data or not data['email']:
        return jsonify({"status": False, "message": "Email is required"}), 400
    
    # Validate email format
    if not validators.email(data['email']):
        return jsonify({"status": False, "message": "Invalid email format"}), 400
    
    # Check if email already exists
    if User.find_by_email(data['email']) and data['email'] != current_user.email:
        return jsonify({"status": False, "message": "Email already in use"}), 400
    
    # Store new email
    current_user.email = data['email']
    current_user.email_verified = False
    current_user.save()
    
    # Generate verification code
    verification_code = VerificationCode(
        user_id=current_user._id,
        email=data['email'],
        code_type="email"
    )
    verification_code.save()
    
    # TODO: Send verification code via email
    
    return jsonify({
        "status": True,
        "message": "Email updated, verification code sent",
        "verification_code": verification_code.code  # In production, don't return this
    }), 200

@settings_bp.route('/phone', methods=['PUT'])
@token_required
@requires_verification
def update_phone(current_user):
    """Update user's phone number"""
    data = request.get_json()
    
    if 'phone' not in data or not data['phone']:
        return jsonify({"status": False, "message": "Phone number is required"}), 400
    
    # Check if phone already exists
    if User.find_by_phone(data['phone']) and data['phone'] != current_user.phone:
        return jsonify({"status": False, "message": "Phone number already in use"}), 400
    
    # Store new phone
    current_user.phone = data['phone']
    current_user.phone_verified = False
    current_user.save()
    
    # Generate verification code
    verification_code = VerificationCode(
        user_id=current_user._id,
        phone=data['phone'],
        code_type="phone"
    )
    verification_code.save()
    
    # TODO: Send verification code via SMS
    
    return jsonify({
        "status": True,
        "message": "Phone updated, verification code sent",
        "verification_code": verification_code.code  # In production, don't return this
    }), 200

@settings_bp.route('/password', methods=['PUT'])
@token_required
@requires_verification
def update_password(current_user):
    """Update user's password"""
    data = request.get_json()
    
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({"status": False, "message": "Current and new password are required"}), 400
    
    # Verify current password
    if not current_user.check_password(data['current_password']):
        return jsonify({"status": False, "message": "Current password is incorrect"}), 400
    
    # Update password
    current_user.password_hash = current_user._hash_password(data['new_password'])
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": "Password updated successfully"
    }), 200

@settings_bp.route('/open-to-more', methods=['PUT'])
@token_required
def update_open_to_more(current_user):
    """Update user's 'open to more' setting"""
    data = request.get_json()
    
    if 'is_open_to_more' not in data:
        return jsonify({"status": False, "message": "Open to more setting is required"}), 400
    
    is_open_to_more = bool(data['is_open_to_more'])
    
    # Update setting
    current_user.is_open_to_more = is_open_to_more
    current_user.save()
    
    return jsonify({
        "status": True,
        "message": f"Open to more setting {'enabled' if is_open_to_more else 'disabled'}",
        "is_open_to_more": is_open_to_more
    }), 200 