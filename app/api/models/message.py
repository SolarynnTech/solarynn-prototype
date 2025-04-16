from datetime import datetime, timezone
from bson import ObjectId
from app.config.database import db

class Message:
    def __init__(self, sender_id, receiver_id, conversation_id, content, message_type="personal"):
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.conversation_id = conversation_id  # Unique ID for the conversation thread
        self.content = content
        self.message_type = message_type  # personal, project, support
        self.is_read = False
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
    
    def to_dict(self):
        """Convert Message object to dictionary for database storage"""
        return {
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "conversation_id": self.conversation_id,
            "content": self.content,
            "message_type": self.message_type,
            "is_read": self.is_read,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a Message object from a dictionary"""
        message = cls(
            sender_id=data["sender_id"],
            receiver_id=data["receiver_id"],
            conversation_id=data["conversation_id"],
            content=data["content"],
            message_type=data.get("message_type", "personal")
        )
        message.is_read = data.get("is_read", False)
        message.created_at = data.get("created_at", datetime.now(timezone.utc))
        message.updated_at = data.get("updated_at", datetime.now(timezone.utc))
        if "_id" in data:
            message._id = str(data["_id"])
        return message
    
    @classmethod
    def find_by_id(cls, message_id):
        """Find message by ID"""
        data = db.messages.find_one({"_id": ObjectId(message_id)})
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    @classmethod
    def find_by_conversation(cls, conversation_id, skip=0, limit=50):
        """Find messages by conversation ID"""
        cursor = db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1).skip(skip).limit(limit)
        messages = []
        for data in cursor:
            data["_id"] = str(data["_id"])
            messages.append(cls.from_dict(data))
        return messages
    
    @classmethod
    def find_by_user(cls, user_id, skip=0, limit=20):
        """Find conversations for a user"""
        # Find unique conversation IDs for this user
        pipeline = [
            {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
            {"$group": {"_id": "$conversation_id"}},
            {"$sort": {"_id.created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        conversation_ids = [doc["_id"] for doc in db.messages.aggregate(pipeline)]
        
        # Get the latest message from each conversation
        conversations = []
        for conv_id in conversation_ids:
            latest_message = db.messages.find({"conversation_id": conv_id}).sort("created_at", -1).limit(1)
            for msg in latest_message:
                msg["_id"] = str(msg["_id"])
                conversations.append({
                    "conversation_id": conv_id,
                    "latest_message": cls.from_dict(msg)
                })
        
        return conversations
    
    @classmethod
    def get_unread_count(cls, user_id):
        """Get count of unread messages for a user"""
        return db.messages.count_documents({
            "receiver_id": user_id,
            "is_read": False
        })
    
    def save(self):
        """Save message to database"""
        message_dict = self.to_dict()
        message_dict["updated_at"] = datetime.now(timezone.utc)
        
        if hasattr(self, "_id"):
            db.messages.update_one({"_id": ObjectId(self._id)}, {"$set": message_dict})
            return self._id
        else:
            result = db.messages.insert_one(message_dict)
            self._id = str(result.inserted_id)
            return self._id
    
    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        self.updated_at = datetime.now(timezone.utc)
        return self.save()
    
    @classmethod
    def generate_conversation_id(cls, user1_id, user2_id, context=None):
        """Generate a unique conversation ID between two users"""
        # Sort user IDs to ensure the same conversation ID is generated regardless of order
        sorted_ids = sorted([user1_id, user2_id])
        
        if context:
            # If there's a context (like a project), include that in the conversation ID
            return f"{sorted_ids[0]}_{sorted_ids[1]}_{context}"
        else:
            return f"{sorted_ids[0]}_{sorted_ids[1]}"
    
    @classmethod
    def mark_conversation_as_read(cls, conversation_id, user_id):
        """Mark all messages in a conversation as read for a specific user"""
        result = db.messages.update_many(
            {"conversation_id": conversation_id, "receiver_id": user_id, "is_read": False},
            {"$set": {"is_read": True, "updated_at": datetime.now(timezone.utc)}}
        )
        return result.modified_count 