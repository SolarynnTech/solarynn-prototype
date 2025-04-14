import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB connection URI from environment variables
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/linkedin_clone')

# Create MongoDB client
client = MongoClient(mongo_uri)

# Get database
db = client.get_database()

# Create indexes for faster queries
def create_indexes():
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

# Run the indexing function
create_indexes() 