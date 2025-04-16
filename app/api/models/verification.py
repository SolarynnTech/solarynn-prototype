import random
import string
from datetime import datetime, timedelta, timezone
from app.config.database import db

class VerificationCode:
    def __init__(self, user_id, email=None, phone=None, code_type="email", purpose="verification"):
        self.user_id = user_id
        self.email = email
        self.phone = phone
        self.code_type = code_type  # email, phone
        self.purpose = purpose  # verification, password_reset
        self.code = self._generate_code()
        self.is_used = False
        self.attempts = 0
        self.expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)  # 15 minutes validity
        self.created_at = datetime.now(timezone.utc)
    
    def _generate_code(self):
        """Generate a 6-digit random code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def to_dict(self):
        """Convert VerificationCode object to dictionary for database storage"""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "phone": self.phone,
            "code_type": self.code_type,
            "purpose": self.purpose,
            "code": self.code,
            "is_used": self.is_used,
            "attempts": self.attempts,
            "expires_at": self.expires_at,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a VerificationCode object from a dictionary"""
        code = cls(
            user_id=data["user_id"],
            email=data.get("email"),
            phone=data.get("phone"),
            code_type=data["code_type"],
            purpose=data["purpose"]
        )
        code.code = data["code"]
        code.is_used = data["is_used"]
        code.attempts = data["attempts"]
        
        # Ensure datetime objects are timezone aware
        expires_at = data["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        code.expires_at = expires_at
        
        created_at = data["created_at"] 
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        code.created_at = created_at
        
        if "_id" in data:
            code._id = str(data["_id"])
        return code
    
    @classmethod
    def find_active_code(cls, user_id, code_type, purpose):
        """Find an active verification code for a user"""
        data = db.verification_codes.find_one({
            "user_id": user_id,
            "code_type": code_type,
            "purpose": purpose,
            "is_used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    @classmethod
    def find_by_code(cls, code, code_type=None, purpose=None):
        """Find a verification code by its value"""
        query = {
            "code": code,
            "is_used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        }
        
        if code_type:
            query["code_type"] = code_type
        
        if purpose:
            query["purpose"] = purpose
        
        data = db.verification_codes.find_one(query)
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    def save(self):
        """Save verification code to database"""
        if hasattr(self, "_id"):
            db.verification_codes.update_one(
                {"_id": self._id},
                {"$set": self.to_dict()}
            )
            return self._id
        else:
            result = db.verification_codes.insert_one(self.to_dict())
            self._id = str(result.inserted_id)
            return self._id
    
    def verify(self, code):
        """Verify that the provided code matches this verification code"""
        # Increment attempts
        self.attempts += 1
        
        if self.is_used:
            return {"status": False, "message": "Code already used"}
        
        # Ensure expires_at is timezone aware
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if expires_at < datetime.now(timezone.utc):
            return {"status": False, "message": "Code expired"}
        
        if self.attempts > 5:  # Limit to 5 attempts
            return {"status": False, "message": "Too many attempts"}
        
        if self.code != code:
            self.save()  # Save updated attempts
            return {"status": False, "message": "Invalid code"}
        
        # Code is valid
        self.is_used = True
        self.save()
        return {"status": True, "message": "Code verified successfully"} 