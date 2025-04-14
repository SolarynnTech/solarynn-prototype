from flask import Blueprint, request, jsonify
from app.api.services.auth_service import AuthService
from app.api.middlewares.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'phone', 'password', 'user_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"status": False, "message": f"Missing required field: {field}"}), 400
    
    # Validate user type
    valid_user_types = ['Public Figure', 'Fashion & Beauty', 'Company', 'Industry Expert']
    if data['user_type'] not in valid_user_types:
        return jsonify({
            "status": False, 
            "message": f"Invalid user type. Must be one of: {', '.join(valid_user_types)}"
        }), 400
    
    # Register user
    result = AuthService.register(
        username=data['username'],
        email=data['email'],
        phone=data['phone'],
        password=data['password'],
        user_type=data['user_type']
    )
    
    if result["status"]:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": False, "message": "Email and password are required"}), 400
    
    # Login user
    result = AuthService.login(
        email=data['email'],
        password=data['password']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 401

@auth_bp.route('/verify/email', methods=['POST'])
def verify_email():
    """Verify user's email with verification code"""
    data = request.get_json()
    
    # Validate required fields
    if 'user_id' not in data or 'code' not in data:
        return jsonify({"status": False, "message": "User ID and code are required"}), 400
    
    # Verify email
    result = AuthService.verify_email(
        user_id=data['user_id'],
        code=data['code']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/verify/phone', methods=['POST'])
def verify_phone():
    """Verify user's phone with verification code"""
    data = request.get_json()
    
    # Validate required fields
    if 'user_id' not in data or 'code' not in data:
        return jsonify({"status": False, "message": "User ID and code are required"}), 400
    
    # Verify phone
    result = AuthService.verify_phone(
        user_id=data['user_id'],
        code=data['code']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/password/reset-request', methods=['POST'])
def request_password_reset():
    """Request a password reset for a user"""
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data:
        return jsonify({"status": False, "message": "Email is required"}), 400
    
    # Request password reset
    result = AuthService.request_password_reset(
        email=data['email']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/password/verify-code', methods=['POST'])
def verify_reset_code():
    """Verify the password reset code"""
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data or 'code' not in data:
        return jsonify({"status": False, "message": "Email and code are required"}), 400
    
    # Verify reset code
    result = AuthService.verify_reset_code(
        email=data['email'],
        code=data['code']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/password/reset', methods=['POST'])
def reset_password():
    """Reset user's password"""
    data = request.get_json()
    
    # Validate required fields
    if 'token' not in data or 'new_password' not in data:
        return jsonify({"status": False, "message": "Token and new password are required"}), 400
    
    # Verify token
    token_result = AuthService.verify_token(data['token'])
    
    if not token_result["status"]:
        return jsonify(token_result), 401
    
    # Reset password
    result = AuthService.reset_password(
        user_id=token_result["user_id"],
        new_password=data['new_password']
    )
    
    if result["status"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current authenticated user information"""
    return jsonify({
        "status": True,
        "user": {
            "id": current_user._id,
            "username": current_user.username,
            "email": current_user.email,
            "phone": current_user.phone,
            "user_type": current_user.user_type,
            "profile_picture": current_user.profile_picture,
            "bio": current_user.bio,
            "social_links": current_user.social_links,
            "email_verified": current_user.email_verified,
            "phone_verified": current_user.phone_verified,
            "is_open_to_more": current_user.is_open_to_more
        }
    }), 200 