# This file marks the directory as a Python package 

import unittest
import os
import sys
import random
import string
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set test database URI in environment variables before importing app modules
os.environ['MONGO_URI'] = 'mongodb://localhost:27017/linkedin_clone_test'

from app import create_app
from app.config.database import db, clear_test_data
from flask import current_app

class BaseTestCase(unittest.TestCase):
    """Base test case for all tests"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test class - run once before all tests"""
        # Create test config
        test_config = {
            "testing": True,
            "MONGO_URI": 'mongodb://localhost:27017/linkedin_clone_test'
        }
        
        # Create app with test config
        cls.app = create_app(test_config=test_config)
        
        # Set up application context for the entire test class
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        
        # Clean the test database completely to ensure a fresh start
        clear_test_data()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after test class - run once after all tests"""
        # Clean up test database
        clear_test_data()
        
        # Remove application context
        cls.app_context.pop()
    
    def setUp(self):
        """Set up test client and other test variables"""
        self.client = self.app.test_client
        
        # Generate a unique ID for this test run
        self.unique_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    
    def _register_and_verify_user(self, user_data):
        """Helper to register and verify a user, then return user_id and token"""
        # Register
        res = self.client().post('/api/auth/register', json=user_data)
        result = json.loads(res.data)
        
        # Check if registration was successful
        if not result.get('status', False):
            # Try to find an existing user
            existing_user = db.users.find_one({"email": user_data["email"]})
            if existing_user:
                user_id = str(existing_user["_id"])
                # Get token
                login_res = self.client().post('/api/auth/login',
                                             json={"email": user_data["email"], 
                                                  "password": user_data["password"]})
                login_result = json.loads(login_res.data)
                if login_result.get('status', False) and 'token' in login_result:
                    # User exists and can log in
                    return user_id, login_result['token']
            
            # Otherwise, clean up and try again
            db.users.delete_many({
                "$or": [
                    {"email": user_data["email"]},
                    {"username": user_data["username"]},
                    {"phone": user_data["phone"]}
                ]
            })
            
            # Try once more
            res = self.client().post('/api/auth/register', json=user_data)
            result = json.loads(res.data)
            if not result.get('status', False):
                self.fail(f"Registration failed: {result}")
        
        # Get user_id and email_code from response
        user_id = result.get('user_id')
        email_code = result.get('email_code')
        
        # If they're not in the response, get them from DB
        if not user_id or not email_code:
            user = db.users.find_one({"email": user_data["email"]})
            if user:
                user_id = str(user["_id"])
                # Get verification code
                verification = db.verification_codes.find_one({"user_id": user_id})
                if verification:
                    email_code = verification.get("email_code")
                else:
                    self.fail("No verification code found")
            else:
                self.fail("User not found after registration")
        
        # Verify email
        verify_res = self.client().post('/api/auth/verify/email',
                                      json={"user_id": user_id, "code": email_code})
        
        # Login and get token
        login_res = self.client().post('/api/auth/login',
                                      json={"email": user_data["email"], 
                                           "password": user_data["password"]})
        login_result = json.loads(login_res.data)
        if not login_result.get('status', False) or 'token' not in login_result:
            self.fail(f"Login failed: {login_result}")
            
        token = login_result['token']
        
        return user_id, token
    
    def tearDown(self):
        """Clean up after each test - subclasses should override this"""
        pass 