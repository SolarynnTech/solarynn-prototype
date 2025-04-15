import unittest
import json
import os
import sys
import random
import string
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config.database import db
from tests import BaseTestCase

class AuthTestCase(BaseTestCase):
    """Test case for the authentication routes"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        super().setUp()
        
        # Test user data with unique values
        self.user = {
            "username": f"testuser_{self.unique_id}",
            "email": f"test_{self.unique_id}@example.com",
            "phone": f"+12345678{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Public Figure"
        }
    
    def test_user_registration(self):
        """Test user registration works correctly"""
        res = self.client().post('/api/auth/register', 
                                json=self.user)
        self.assertEqual(res.status_code, 201)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue('user_id' in result)
    
    def test_email_verification(self):
        """Test email verification works correctly"""
        # First register a user
        res = self.client().post('/api/auth/register', 
                                json=self.user)
        result = json.loads(res.data)
        
        # Get user_id and email_code
        user_id = result.get('user_id')
        email_code = result.get('email_code')
        
        # If not in response, get from database
        if not user_id or not email_code:
            user = db.users.find_one({"email": self.user["email"]})
            if user:
                user_id = str(user["_id"])
                
                # Get verification code
                verification = db.verification_codes.find_one({"user_id": user_id})
                if verification:
                    email_code = verification.get("email_code")
        
        # Now verify email
        res = self.client().post('/api/auth/verify/email',
                               json={"user_id": user_id, "code": email_code})
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
    
    def test_user_login(self):
        """Test login works correctly"""
        # Register and verify a user
        user_id, token = self._register_and_verify_user(self.user)
        
        # Test the token is valid and non-empty
        self.assertTrue(token)
        self.assertTrue(len(token) > 10)
    
    def test_invalid_login(self):
        """Test login with invalid credentials fails"""
        # First register and verify a user for this test
        self._register_and_verify_user(self.user)
        
        # Now try to login with wrong password
        res = self.client().post('/api/auth/login',
                               json={"email": self.user["email"], 
                                     "password": "wrongpassword"})
        self.assertEqual(res.status_code, 401)
        result = json.loads(res.data)
        self.assertFalse(result['status'])

    def tearDown(self):
        """Clean up after each test"""
        # Clean test database just for this user
        db.users.delete_many({"email": self.user["email"]})
        db.verification_codes.delete_many({"email": self.user["email"]})

if __name__ == "__main__":
    unittest.main() 