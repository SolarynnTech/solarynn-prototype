from datetime import datetime, timezone
from bson import ObjectId
import bcrypt
from app.config.database import db

class User:
    def __init__(self, username, email, phone, password, user_type, 
                 profile_picture=None, social_links=None, onboarding_responses=None):
        self.username = username
        self.email = email
        self.phone = phone
        self.password_hash = self._hash_password(password)
        self.user_type = user_type  # Public Figure, Fashion & Beauty, Company, Industry Expert
        self.profile_picture = profile_picture
        self.bio = ""
        self.social_links = social_links or {}
        self.onboarding_responses = onboarding_responses or {}
        self.favorites = {
            "users": [],
            "projects": []
        }
        self.settings = {
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
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.email_verified = False
        self.phone_verified = False
        self.is_open_to_more = True  # Open to more light option in settings
    
    def _hash_password(self, password):
        """Hash the password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert User object to dictionary for database storage"""
        return {
            "username": self.username,
            "email": self.email,
            "phone": self.phone,
            "password_hash": self.password_hash,
            "user_type": self.user_type,
            "profile_picture": self.profile_picture,
            "bio": self.bio,
            "social_links": self.social_links,
            "onboarding_responses": self.onboarding_responses,
            "favorites": self.favorites,
            "settings": self.settings,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "email_verified": self.email_verified,
            "phone_verified": self.phone_verified,
            "is_open_to_more": self.is_open_to_more
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a User object from a dictionary"""
        user = cls(
            username=data["username"],
            email=data["email"],
            phone=data["phone"],
            password="",  # Not used when creating from dictionary
            user_type=data["user_type"],
            profile_picture=data.get("profile_picture"),
            social_links=data.get("social_links"),
            onboarding_responses=data.get("onboarding_responses")
        )
        user.password_hash = data["password_hash"]
        user.bio = data.get("bio", "")
        user.favorites = data.get("favorites", {"users": [], "projects": []})
        
        # Set settings with defaults if not present
        user.settings = data.get("settings", {
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
        })
        
        user.created_at = data.get("created_at", datetime.now(timezone.utc))
        user.updated_at = data.get("updated_at", datetime.now(timezone.utc))
        user.email_verified = data.get("email_verified", False)
        user.phone_verified = data.get("phone_verified", False)
        user.is_open_to_more = data.get("is_open_to_more", True)
        
        if "_id" in data:
            user._id = data["_id"]
            
        return user
    
    @classmethod
    def find_by_id(cls, user_id):
        """Find user by ID"""
        data = db.users.find_one({"_id": ObjectId(user_id)})
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        data = db.users.find_one({"email": email})
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    @classmethod
    def find_by_phone(cls, phone):
        """Find user by phone number"""
        data = db.users.find_one({"phone": phone})
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    def save(self):
        """Save user to database"""
        user_dict = self.to_dict()
        user_dict["updated_at"] = datetime.now(timezone.utc)
        
        if hasattr(self, "_id"):
            # Update existing user
            result = db.users.update_one(
                {"_id": ObjectId(self._id)}, 
                {"$set": user_dict}
            )
            return self._id
        else:
            # Check if a user with this email already exists
            existing_user = User.find_by_email(self.email)
            if existing_user:
                self._id = existing_user._id
                return db.users.update_one(
                    {"_id": ObjectId(self._id)}, 
                    {"$set": user_dict}
                )
            else:
                # Insert new user
                result = db.users.insert_one(user_dict)
                self._id = str(result.inserted_id)
                return self._id
    
    def update(self, data):
        """Update user with provided data"""
        for key, value in data.items():
            if key != "_id" and hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now(timezone.utc)
        return self.save() 