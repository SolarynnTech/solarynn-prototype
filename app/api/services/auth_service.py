import os
import random
import string
from datetime import datetime, timedelta, timezone
import jwt
from app.api.models.user import User
from app.api.models.verification import VerificationCode

class AuthService:
    @staticmethod
    def register(username, email, phone, password, user_type):
        """Register a new user"""
        # Check if user already exists
        if User.find_by_email(email):
            return {"status": False, "message": "Email already registered"}
        
        if User.find_by_phone(phone):
            return {"status": False, "message": "Phone number already registered"}
        
        # Create and save new user
        user = User(
            username=username,
            email=email,
            phone=phone,
            password=password,
            user_type=user_type
        )
        user_id = user.save()
        
        # Generate verification codes for email and phone
        email_code = VerificationCode(user_id=user_id, email=email, code_type="email")
        email_code.save()
        
        phone_code = VerificationCode(user_id=user_id, phone=phone, code_type="phone")
        phone_code.save()
        
        # TODO: Send email and SMS with verification codes
        
        return {
            "status": True, 
            "message": "User registered successfully",
            "user_id": user_id,
            "email_code": email_code.code,  # In production, don't return this
            "phone_code": phone_code.code   # In production, don't return this
        }
    
    @staticmethod
    def login(email, password):
        """Login a user with email and password"""
        user = User.find_by_email(email)
        
        if not user:
            return {"status": False, "message": "User not found"}
        
        if not user.check_password(password):
            return {"status": False, "message": "Invalid password"}
        
        # Generate JWT token
        token = AuthService.generate_token(user._id)
        
        return {
            "status": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user._id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "user_type": user.user_type,
                "email_verified": user.email_verified,
                "phone_verified": user.phone_verified
            }
        }
    
    @staticmethod
    def verify_email(user_id, code):
        """Verify user's email with verification code"""
        return AuthService._verify_contact(user_id, code, "email")
    
    @staticmethod
    def verify_phone(user_id, code):
        """Verify user's phone with verification code"""
        return AuthService._verify_contact(user_id, code, "phone")
    
    @staticmethod
    def _verify_contact(user_id, code, code_type):
        """Internal method to verify email or phone"""
        # Find the active verification code
        verification_code = VerificationCode.find_active_code(
            user_id=user_id,
            code_type=code_type,
            purpose="verification"
        )
        
        if not verification_code:
            return {"status": False, "message": f"No active {code_type} verification code found"}
        
        # Verify the code
        result = verification_code.verify(code)
        
        if result["status"]:
            # Update user's verification status
            user = User.find_by_id(user_id)
            if not user:
                return {"status": False, "message": "User not found"}
                
            if code_type == "email":
                user.email_verified = True
            elif code_type == "phone":
                user.phone_verified = True
                
            # Make sure the _id attribute is set before saving
            if not hasattr(user, "_id"):
                user._id = user_id
                
            user.save()
            
            result["message"] = f"{code_type.capitalize()} verified successfully"
        
        return result
    
    @staticmethod
    def request_password_reset(email):
        """Request a password reset for a user"""
        user = User.find_by_email(email)
        
        if not user:
            return {"status": False, "message": "User not found"}
        
        # Check if user has verified email or phone
        if not (user.email_verified or user.phone_verified):
            return {"status": False, "message": "Please verify your email or phone first"}
        
        # Determine which verification method to use
        if user.email_verified:
            code_type = "email"
            contact = user.email
        else:
            code_type = "phone"
            contact = user.phone
        
        # Generate password reset code
        verification_code = VerificationCode(
            user_id=user._id,
            email=user.email if code_type == "email" else None,
            phone=user.phone if code_type == "phone" else None,
            code_type=code_type,
            purpose="password_reset"
        )
        verification_code.save()
        
        # TODO: Send code via email or SMS
        
        return {
            "status": True,
            "message": f"Password reset code sent to your {code_type}",
            "code": verification_code.code,  # In production, don't return this
            "code_type": code_type
        }
    
    @staticmethod
    def verify_reset_code(email, code):
        """Verify the password reset code"""
        user = User.find_by_email(email)
        
        if not user:
            return {"status": False, "message": "User not found"}
        
        # Find the active verification code
        verification_code = VerificationCode.find_by_code(
            code=code,
            purpose="password_reset"
        )
        
        if not verification_code or verification_code.user_id != user._id:
            return {"status": False, "message": "Invalid or expired code"}
        
        # Verify the code
        result = verification_code.verify(code)
        
        if result["status"]:
            # Generate a temporary token for password reset
            token = AuthService.generate_token(user._id, expires_in=15*60)  # 15 minutes
            result["token"] = token
            result["message"] = "Code verified successfully"
        
        return result
    
    @staticmethod
    def reset_password(user_id, new_password):
        """Reset user's password"""
        user = User.find_by_id(user_id)
        
        if not user:
            return {"status": False, "message": "User not found"}
        
        # Update password
        user.password_hash = user._hash_password(new_password)
        user.save()
        
        return {"status": True, "message": "Password reset successfully"}
    
    @staticmethod
    def generate_token(user_id, expires_in=86400):
        """Generate JWT token for user authentication"""
        # Set expiration time
        exp = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        
        # Create payload
        payload = {
            "user_id": user_id,
            "exp": exp
        }
        
        # Get secret key from environment
        secret_key = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
        
        # Generate token
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        
        return token
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token and return user ID if valid"""
        try:
            # Get secret key from environment
            secret_key = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
            
            # Decode token
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            
            # Get user ID from payload
            user_id = payload.get("user_id")
            
            return {"status": True, "user_id": user_id}
        except jwt.ExpiredSignatureError:
            return {"status": False, "message": "Token expired"}
        except jwt.InvalidTokenError:
            return {"status": False, "message": "Invalid token"} 