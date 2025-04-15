import unittest
import json
import os
import sys
import io
import random
import string
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.config.database import db
from tests import BaseTestCase

class ProfileTestCase(BaseTestCase):
    """Test case for the profile routes"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        super().setUp()
        
        # Test user data for multiple users
        self.user1 = {
            "username": f"testuser1_{self.unique_id}",
            "email": f"test1_{self.unique_id}@example.com",
            "phone": f"+1234567{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Public Figure"
        }
        
        self.user2 = {
            "username": f"testuser2_{self.unique_id}",
            "email": f"test2_{self.unique_id}@example.com",
            "phone": f"+0987654{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Industry Expert"
        }
        
        # Execute all requests in the context of the app
        with self.app.app_context():
            # Clear test database - make sure to delete all users with these emails
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
        
        # Register and verify users - do one at a time to prevent race conditions
        self.user1_id, self.user1_token = self._register_and_verify_user(self.user1)
        self.user2_id, self.user2_token = self._register_and_verify_user(self.user2)
        
    def _register_and_verify_user(self, user_data):
        """Helper to register and verify a user, then return user_id and token"""
        # Register
        res = self.client().post('/api/auth/register', json=user_data)
        result = json.loads(res.data)
        user_id = result['user_id']
        email_code = result['email_code']
        
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
    
    def test_get_own_profile(self):
        """Test getting own profile"""
        res = self.client().get(
            '/api/profile/',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertEqual(result['profile']['username'], self.user1['username'])
        self.assertEqual(result['profile']['email'], self.user1['email'])
        self.assertEqual(result['profile']['user_type'], self.user1['user_type'])
        self.assertTrue(result['profile']['email_verified'])
    
    def test_get_user_profile(self):
        """Test getting another user's profile"""
        res = self.client().get(
            f'/api/profile/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertEqual(result['profile']['username'], self.user2['username'])
        self.assertEqual(result['profile']['user_type'], self.user2['user_type'])
        # Should not contain sensitive information
        self.assertNotIn('email', result['profile'])
        self.assertNotIn('phone', result['profile'])
    
    def test_update_profile(self):
        """Test updating profile"""
        update_data = {
            "username": "updateduser1",
            "bio": "This is my updated bio",
            "social_links": {
                "twitter": "https://twitter.com/updateduser1",
                "instagram": "https://instagram.com/updateduser1"
            }
        }
        
        res = self.client().put(
            '/api/profile/update',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=update_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertEqual(result['profile']['username'], update_data['username'])
        self.assertEqual(result['profile']['bio'], update_data['bio'])
        self.assertEqual(result['profile']['social_links'], update_data['social_links'])
        
        # Verify updates by getting profile again
        verify_res = self.client().get(
            '/api/profile/',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        verify_result = json.loads(verify_res.data)
        self.assertEqual(verify_result['profile']['username'], update_data['username'])
        self.assertEqual(verify_result['profile']['bio'], update_data['bio'])
        self.assertEqual(verify_result['profile']['social_links'], update_data['social_links'])
    
    def test_update_onboarding(self):
        """Test updating onboarding responses"""
        onboarding_data = {
            "responses": {
                "interests": ["Technology", "Design", "Education"],
                "preferred_collaborations": ["Remote", "Short-term"],
                "experience_level": "Intermediate"
            }
        }
        
        res = self.client().post(
            '/api/profile/onboarding',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=onboarding_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify updates by getting profile
        verify_res = self.client().get(
            '/api/profile/',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        verify_result = json.loads(verify_res.data)
        self.assertEqual(verify_result['profile']['onboarding_responses'], onboarding_data['responses'])
    
    def test_favorite_user(self):
        """Test favoriting a user"""
        # Favorite user2 as user1
        res = self.client().post(
            f'/api/profile/favorite/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue(result['is_favorited'])
        
        # Check favorites list
        get_favs_res = self.client().get(
            '/api/profile/favorites/users',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        get_favs_result = json.loads(get_favs_res.data)
        self.assertTrue(any(fav['id'] == self.user2_id for fav in get_favs_result['favorites']))
        
        # Unfavorite the user
        unfav_res = self.client().post(
            f'/api/profile/favorite/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        unfav_result = json.loads(unfav_res.data)
        self.assertFalse(unfav_result['is_favorited'])
    
    def test_collaboration_request(self):
        """Test sending a collaboration request"""
        collab_data = {
            "message": "I would like to collaborate with you on a project"
        }
        
        res = self.client().post(
            f'/api/profile/collaboration-request/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=collab_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertIn('conversation_id', result)
        
        # The recipient should have the message
        # We would need to check this in a message test
    
    def test_project_proposal(self):
        """Test sending a project proposal"""
        proposal_data = {
            "title": "New Project Proposal",
            "description": "Let's collaborate on this exciting project",
            "budget": "1000-5000"
        }
        
        res = self.client().post(
            f'/api/profile/project-proposal/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=proposal_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertIn('conversation_id', result)
        
        # The recipient should have the message with the proposal
        # We would need to check this in a message test
    
    def test_invalid_profile_update(self):
        """Test updating profile with invalid data"""
        # Test with invalid social link URL
        invalid_data = {
            "social_links": {
                "twitter": "not-a-valid-url"
            }
        }
        
        res = self.client().put(
            '/api/profile/update',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=invalid_data
        )
        self.assertNotEqual(res.status_code, 200)  # Should not be successful
        result = json.loads(res.data)
        self.assertFalse(result['status'])
    
    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            # Clean test database
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
            # Also try with updated username
            db.users.delete_many({"username": "updateduser1"})

if __name__ == "__main__":
    unittest.main() 