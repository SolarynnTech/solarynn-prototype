import unittest
import json
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.config.database import db

class AuthTestCase(unittest.TestCase):
    """Test case for the authentication routes"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        self.app = create_app()
        self.client = self.app.test_client
        
        # Test user data
        self.user = {
            "username": "testuser",
            "email": "test@example.com",
            "phone": "+1234567890",
            "password": "Password123",
            "user_type": "Public Figure"
        }
        
        # Execute all requests in the context of the app
        with self.app.app_context():
            # Clear test database
            db.users.delete_many({"email": self.user["email"]})
            db.verification_codes.delete_many({})
    
    def test_user_registration(self):
        """Test user registration works correctly"""
        res = self.client().post('/api/auth/register', 
                                json=self.user)
        self.assertEqual(res.status_code, 201)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue('user_id' in result)
        
        # Store verification codes for next tests
        self.email_code = result['email_code']
        self.phone_code = result['phone_code']
        self.user_id = result['user_id']
    
    def test_email_verification(self):
        """Test email verification works correctly"""
        # First register a user
        res = self.client().post('/api/auth/register', 
                                json=self.user)
        result = json.loads(res.data)
        email_code = result['email_code']
        user_id = result['user_id']
        
        # Now verify email
        res = self.client().post('/api/auth/verify/email',
                               json={"user_id": user_id, "code": email_code})
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
    
    def test_user_login(self):
        """Test login works correctly"""
        # First register and verify a user
        res = self.client().post('/api/auth/register', 
                                json=self.user)
        result = json.loads(res.data)
        email_code = result['email_code']
        user_id = result['user_id']
        
        # Verify email
        self.client().post('/api/auth/verify/email',
                         json={"user_id": user_id, "code": email_code})
        
        # Now login
        res = self.client().post('/api/auth/login',
                               json={"email": self.user["email"], 
                                     "password": self.user["password"]})
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue('token' in result)
    
    def test_invalid_login(self):
        """Test login with invalid credentials fails"""
        res = self.client().post('/api/auth/login',
                               json={"email": self.user["email"], 
                                     "password": "wrongpassword"})
        self.assertEqual(res.status_code, 401)
        result = json.loads(res.data)
        self.assertFalse(result['status'])

    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            # Clean test database
            db.users.delete_many({"email": self.user["email"]})
            db.verification_codes.delete_many({})

if __name__ == "__main__":
    unittest.main() 