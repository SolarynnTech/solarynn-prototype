import os
import sys
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.api.services.auth_service import AuthService

# Create the app
app = create_app()

# Test user data
user_data = {
    "username": "debuguser",
    "email": "debug@example.com",
    "phone": "+9876543210",
    "password": "Password123",
    "user_type": "Public Figure"
}

with app.app_context():
    # Call the register function directly
    result = AuthService.register(
        username=user_data["username"],
        email=user_data["email"],
        phone=user_data["phone"],
        password=user_data["password"],
        user_type=user_data["user_type"]
    )
    
    # Print the complete result
    print("Register API response structure:")
    print(json.dumps(result, indent=2))
    
    # Try to access user_id and email_code
    if 'user_id' in result:
        print("\nCan access user_id:", result['user_id'])
    else:
        print("\nCannot access user_id")
        print("Available keys:", list(result.keys())) 