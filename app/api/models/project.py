from datetime import datetime
from bson import ObjectId
from app.config.database import db

class Project:
    def __init__(self, user_id, title, description, images=None, categories=None, 
                 budget=None, is_private=False):
        self.user_id = user_id
        self.title = title
        self.description = description
        self.images = images or []
        self.categories = categories or []  # Target audience categories
        self.budget = budget
        self.is_private = is_private
        self.collaborators = []
        self.collaboration_requests = []
        self.favorites_count = 0
        self.ratings = []
        self.avg_rating = 0.0
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert Project object to dictionary for database storage"""
        return {
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "images": self.images,
            "categories": self.categories,
            "budget": self.budget,
            "is_private": self.is_private,
            "collaborators": self.collaborators,
            "collaboration_requests": self.collaboration_requests,
            "favorites_count": self.favorites_count,
            "ratings": self.ratings,
            "avg_rating": self.avg_rating,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a Project object from a dictionary"""
        project = cls(
            user_id=data["user_id"],
            title=data["title"],
            description=data["description"],
            images=data.get("images", []),
            categories=data.get("categories", []),
            budget=data.get("budget"),
            is_private=data.get("is_private", False)
        )
        project.collaborators = data.get("collaborators", [])
        project.collaboration_requests = data.get("collaboration_requests", [])
        project.favorites_count = data.get("favorites_count", 0)
        project.ratings = data.get("ratings", [])
        project.avg_rating = data.get("avg_rating", 0.0)
        project.created_at = data.get("created_at", datetime.utcnow())
        project.updated_at = data.get("updated_at", datetime.utcnow())
        if "_id" in data:
            project._id = str(data["_id"])
        return project
    
    @classmethod
    def find_by_id(cls, project_id):
        """Find project by ID"""
        data = db.projects.find_one({"_id": ObjectId(project_id)})
        if data:
            data["_id"] = str(data["_id"])
            return cls.from_dict(data)
        return None
    
    @classmethod
    def find_by_user_id(cls, user_id, skip=0, limit=20, include_private=False):
        """Find projects by user ID"""
        query = {"user_id": user_id}
        if not include_private:
            query["is_private"] = False
            
        cursor = db.projects.find(query).sort("created_at", -1).skip(skip).limit(limit)
        projects = []
        for data in cursor:
            data["_id"] = str(data["_id"])
            projects.append(cls.from_dict(data))
        return projects
    
    @classmethod
    def find_by_categories(cls, categories, skip=0, limit=20):
        """Find projects by categories"""
        query = {"categories": {"$in": categories}, "is_private": False}
        cursor = db.projects.find(query).sort("created_at", -1).skip(skip).limit(limit)
        projects = []
        for data in cursor:
            data["_id"] = str(data["_id"])
            projects.append(cls.from_dict(data))
        return projects
    
    def save(self):
        """Save project to database"""
        project_dict = self.to_dict()
        project_dict["updated_at"] = datetime.utcnow()
        
        if hasattr(self, "_id"):
            db.projects.update_one({"_id": ObjectId(self._id)}, {"$set": project_dict})
            return self._id
        else:
            result = db.projects.insert_one(project_dict)
            self._id = str(result.inserted_id)
            return self._id
    
    def update(self, data):
        """Update project with provided data"""
        for key, value in data.items():
            if key != "_id" and hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        return self.save()
    
    def add_rating(self, user_id, rating, feedback=None):
        """Add or update a rating to the project"""
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        
        # Check if user already rated this project
        for i, r in enumerate(self.ratings):
            if r["user_id"] == user_id:
                # Update existing rating
                self.ratings[i] = {
                    "user_id": user_id,
                    "rating": rating,
                    "feedback": feedback,
                    "created_at": r["created_at"],
                    "updated_at": datetime.utcnow()
                }
                break
        else:
            # Add new rating
            self.ratings.append({
                "user_id": user_id,
                "rating": rating,
                "feedback": feedback,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        # Calculate average rating
        total_rating = sum(r["rating"] for r in self.ratings)
        self.avg_rating = total_rating / len(self.ratings) if self.ratings else 0
        
        return self.save()
    
    def add_collaboration_request(self, user_id, message=None):
        """Add a collaboration request to the project"""
        for req in self.collaboration_requests:
            if req["user_id"] == user_id:
                return False  # Request already exists
        
        self.collaboration_requests.append({
            "user_id": user_id,
            "message": message,
            "status": "pending",  # pending, accepted, rejected
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        return self.save()
    
    def update_collaboration_request(self, user_id, status):
        """Update the status of a collaboration request"""
        for i, req in enumerate(self.collaboration_requests):
            if req["user_id"] == user_id:
                self.collaboration_requests[i]["status"] = status
                self.collaboration_requests[i]["updated_at"] = datetime.utcnow()
                
                # If accepted, add user to collaborators
                if status == "accepted" and user_id not in self.collaborators:
                    self.collaborators.append(user_id)
                
                return self.save()
        
        return False  # Request not found
    
    def delete(self):
        """Delete project from database"""
        if hasattr(self, "_id"):
            db.projects.delete_one({"_id": ObjectId(self._id)})
            return True
        return False 