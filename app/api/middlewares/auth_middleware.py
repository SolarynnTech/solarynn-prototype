from functools import wraps
from flask import request, jsonify
from app.api.services.auth_service import AuthService
from app.api.models.user import User

def token_required(f):
    """Decorator to check if a valid JWT token is in the request header"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if Authorization header is present
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            
            # Check if Authorization header has correct format
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({"status": False, "message": "Authentication token is missing"}), 401
        
        # Verify token
        result = AuthService.verify_token(token)
        
        if not result["status"]:
            return jsonify(result), 401
        
        # Get user from database
        current_user = User.find_by_id(result["user_id"])
        
        if not current_user:
            return jsonify({"status": False, "message": "User not found"}), 401
        
        # Pass the user to the route
        return f(current_user, *args, **kwargs)
    
    return decorated

def requires_verification(f):
    """Decorator to check if user has verified email or phone"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not (current_user.email_verified or current_user.phone_verified):
            return jsonify({
                "status": False, 
                "message": "Please verify your email or phone to access this feature"
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated 