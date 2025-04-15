import unittest
import json
import os
import sys
import random
import string
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.config.database import db

class SettingsTestCase(unittest.TestCase):
    """Test case for the settings routes"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        self.app = create_app(test_config={"testing": True})
        self.client = self.app.test_client
        
        # Generate unique test emails
        self.unique_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        
        # Test user data
        self.user = {
            "username": f"settingsuser_{self.unique_id}",
            "email": f"settings_{self.unique_id}@example.com",
            "phone": f"+1234567890{self.unique_id[:4]}",
            "password": "Password123",
            "user_type": "Public Figure"
        }
        
        # Second user data for public settings test
        self.user2 = {
            "username": f"settingsuser2_{self.unique_id}",
            "email": f"settings2_{self.unique_id}@example.com",
            "phone": f"+0987654321{self.unique_id[:4]}",
            "password": "Password123",
            "user_type": "Public Figure"
        }
        
        # Execute all requests in the context of the app
        with self.app.app_context():
            # Clear test database
            db.users.delete_many({"email": self.user["email"]})
            db.users.delete_many({"email": self.user2["email"]})
        
        # Register and verify user
        self.user_id, self.token = self._register_and_verify_user(self.user)
        
    def _register_and_verify_user(self, user_data):
        """Helper to register and verify a user, then return user_id and token"""
        # Register
        res = self.client().post('/api/auth/register', json=user_data)
        result = json.loads(res.data)
        
        # Check if registration was successful
        if not result.get('status', False):
            raise Exception(f"Failed to register user: {result.get('message', 'Unknown error')}")
            
        user_id = result.get('user_id')
        email_code = result.get('email_code')
        
        if not user_id or not email_code:
            # Find user by email if user_id is not in the response
            with self.app.app_context():
                user_data = db.users.find_one({"email": user_data["email"]})
                if user_data:
                    user_id = str(user_data["_id"])
                else:
                    raise Exception("User not found after registration")
        
        # Verify email
        self.client().post('/api/auth/verify/email',
                          json={"user_id": user_id, "code": email_code})
        
        # Login and get token
        login_res = self.client().post('/api/auth/login',
                                      json={"email": user_data["email"], 
                                           "password": user_data["password"]})
        login_result = json.loads(login_res.data)
        token = login_result['token']
        
        return user_id, token
    
    def test_get_settings(self):
        """Test getting user settings"""
        res = self.client().get(
            '/api/settings/',
            headers={"Authorization": f"Bearer {self.token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify default settings exist
        self.assertIn('notifications', result['settings'])
        self.assertIn('privacy', result['settings'])
        self.assertIn('theme', result['settings'])
    
    def test_update_notification_settings(self):
        """Test updating notification settings"""
        notification_settings = {
            "email_notifications": False,
            "push_notifications": True,
            "message_notifications": True,
            "collaboration_notifications": False
        }
        
        res = self.client().put(
            '/api/settings/notifications',
            headers={"Authorization": f"Bearer {self.token}"},
            json=notification_settings
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify settings were updated
        get_res = self.client().get(
            '/api/settings/',
            headers={"Authorization": f"Bearer {self.token}"}
        )
        get_result = json.loads(get_res.data)
        
        for key, value in notification_settings.items():
            self.assertEqual(get_result['settings']['notifications'][key], value)
    
    def test_update_privacy_settings(self):
        """Test updating privacy settings"""
        privacy_settings = {
            "show_email": False,
            "show_phone": False,
            "show_projects": True,
            "allow_messages_from": "connections_only",
            "profile_visibility": "public"
        }
        
        res = self.client().put(
            '/api/settings/privacy',
            headers={"Authorization": f"Bearer {self.token}"},
            json=privacy_settings
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify settings were updated
        get_res = self.client().get(
            '/api/settings/',
            headers={"Authorization": f"Bearer {self.token}"}
        )
        get_result = json.loads(get_res.data)
        
        for key, value in privacy_settings.items():
            self.assertEqual(get_result['settings']['privacy'][key], value)
    
    def test_update_theme_settings(self):
        """Test updating theme settings"""
        theme_settings = {
            "mode": "dark",
            "color": "blue",
            "font_size": "medium"
        }
        
        res = self.client().put(
            '/api/settings/theme',
            headers={"Authorization": f"Bearer {self.token}"},
            json=theme_settings
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify settings were updated
        get_res = self.client().get(
            '/api/settings/',
            headers={"Authorization": f"Bearer {self.token}"}
        )
        get_result = json.loads(get_res.data)
        
        for key, value in theme_settings.items():
            self.assertEqual(get_result['settings']['theme'][key], value)
    
    def test_get_public_settings(self):
        """Test getting public settings for another user"""
        # Register and get token for user2
        user2_id, user2_token = self._register_and_verify_user(self.user2)
        
        # Set privacy settings for user1
        privacy_settings = {
            "show_email": False,
            "show_phone": False,
            "show_projects": True,
            "allow_messages_from": "everyone",
            "profile_visibility": "public"
        }
        
        self.client().put(
            '/api/settings/privacy',
            headers={"Authorization": f"Bearer {self.token}"},
            json=privacy_settings
        )
        
        # Get user1's public settings as user2
        res = self.client().get(
            f'/api/settings/public/{self.user_id}',
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Public settings should only include certain fields
        self.assertIn('allow_messages_from', result['settings'])
        self.assertIn('profile_visibility', result['settings'])
        self.assertIn('show_projects', result['settings'])
        
        # Should not include sensitive settings
        self.assertNotIn('notifications', result['settings'])
        self.assertNotIn('theme', result['settings'])
    
    def test_invalid_settings_update(self):
        """Test updating settings with invalid data"""
        invalid_data = {
            "mode": "invalid_mode",
            "color": "invalid_color",
            "font_size": "extra_large"
        }
        
        res = self.client().put(
            '/api/settings/theme',
            headers={"Authorization": f"Bearer {self.token}"},
            json=invalid_data
        )
        self.assertNotEqual(res.status_code, 200)  # Should not be successful
        result = json.loads(res.data)
        self.assertFalse(result['status'])
    
    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            # Clean test database
            db.users.delete_many({"email": self.user["email"]})
            db.users.delete_many({"email": self.user2["email"]})

if __name__ == "__main__":
    unittest.main() 