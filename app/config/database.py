import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
from flask import current_app, g

# Load environment variables
load_dotenv()

def get_db():
    """Get the MongoDB database instance based on app config or environment"""
    # If in application context and already connected, return the existing connection
    try:
        if current_app and 'db' in g:
            return g.db
    except RuntimeError:
        # Not in application context, don't use flask.g
        pass
    
    # Get MongoDB connection URI from app config or environment variables
    mongo_uri = None
    try:
        if current_app and 'MONGO_URI' in current_app.config:
            mongo_uri = current_app.config['MONGO_URI']
    except RuntimeError:
        # Not in application context
        pass
    
    # Default if not in application context or not in config
    if not mongo_uri:
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/linkedin_clone')
    
    # Create MongoDB client
    client = MongoClient(mongo_uri)
    
    # Get database
    db_instance = client.get_database()
    
    # Store in flask.g if we're in a request context
    try:
        if current_app:
            g.db = db_instance
    except RuntimeError:
        # Not in application context
        pass
    
    return db_instance

# Global database instance for usage outside of request context
db = get_db()

# Clear all test data (only for test database)
def clear_test_data():
    """Clear all data from the test database - only runs if using test database"""
    mongo_uri = None
    try:
        if current_app and 'MONGO_URI' in current_app.config:
            mongo_uri = current_app.config['MONGO_URI']
    except RuntimeError:
        # Not in application context
        mongo_uri = os.environ.get('MONGO_URI', '')
    
    # Only clear if it's a test database
    if mongo_uri and 'test' in mongo_uri:
        db = get_db()
        # Clear all collections
        for collection in db.list_collection_names():
            db[collection].delete_many({})
        return True
    return False

# Create indexes for faster queries
def create_indexes():
    """Create necessary database indexes"""
    db = get_db()
    
    try:
        # Users collection indexes
        db.users.create_index("email", unique=True)
        db.users.create_index("phone", unique=True)
        db.users.create_index("username", unique=True)
        
        # Projects collection indexes
        db.projects.create_index("user_id")
        db.projects.create_index("categories")
        
        # Messages collection indexes
        db.messages.create_index([("sender_id", 1), ("receiver_id", 1)])
        db.messages.create_index("conversation_id")
        
        # Verification codes collection with TTL index
        db.verification_codes.create_index("created_at", expireAfterSeconds=3600)  # Expire after 1 hour
    except Exception as e:
        # Log the error but don't crash - indexes will be created when app starts
        print(f"Warning: Could not create indexes: {e}")

# Run the indexing function
try:
    create_indexes()
except Exception as e:
    # Log the error but don't crash - indexes will be created when app starts
    print(f"Warning: Could not create indexes: {e}") 