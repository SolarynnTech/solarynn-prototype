from flask import Blueprint, request, jsonify
from app.api.models.user import User
from app.api.models.verification import VerificationCode
from app.api.middlewares.auth_middleware import token_required, requires_verification
from app.api.services.auth_service import AuthService
import validators

settings_bp = Blueprint('settings', __name__)

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