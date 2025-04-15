import os
import sys
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app

# Create the app
app = create_app()
client = app.test_client

# Test user data
user_data = {
    "username": "debuguser2",
    "email": "debug2@example.com",
    "phone": "+9876543211",
    "password": "Password123",
    "user_type": "Public Figure"
}

# Call the register route
res = client().post('/api/auth/register', json=user_data)
result = json.loads(res.data)

# Print the complete result
print("Register API response structure:")
print(json.dumps(result, indent=2))

# Try to access user_id and email_code
if 'user_id' in result:
    print("\nCan access user_id:", result['user_id'])
else:
    print("\nCannot access user_id")
    print("Available keys:", list(result.keys())) 