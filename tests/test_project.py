import unittest
import json
import os
import sys
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import random
import string
from app import create_app
from app.config.database import db
from tests import BaseTestCase

class ProjectTestCase(BaseTestCase):
    """Test case for the project routes"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        super().setUp()
        # Test user data for multiple users
        self.user1 = {
            "username": f"projectowner_{self.unique_id}",
            "email": f"owner_{self.unique_id}@example.com",
            "phone": f"+1234567{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Public Figure"
        }
        
        self.user2 = {
            "username": f"collaborator_{self.unique_id}",
            "email": f"collab_{self.unique_id}@example.com",
            "phone": f"+0987654{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Industry Expert"
        }
        
        # Test project data
        self.project = {
            "title": "Test Project",
            "description": "This is a test project",
            "categories": ["Technology", "Design"],
            "budget": "1000-5000",
            "is_private": False
        }
        
        # Execute all requests in the context of the app
        with self.app.app_context():
            # Clear test database
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
            db.projects.delete_many({"title": self.project["title"]})
        
        # Register and verify users
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
    
    def test_create_project(self):
        """Test project creation"""
        res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        self.assertEqual(res.status_code, 201)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue('project_id' in result)
        
        # Store project_id for subsequent tests
        self.project_id = result['project_id']
    
    def test_get_project(self):
        """Test getting a project by ID"""
        # First create a project
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Get the project
        res = self.client().get(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertEqual(result['project']['title'], self.project['title'])
        self.assertEqual(result['project']['description'], self.project['description'])
        self.assertTrue(result['project']['is_owner'])
    
    def test_update_project(self):
        """Test updating a project"""
        # First create a project
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Update the project
        updated_data = {
            "title": "Updated Test Project",
            "description": "This is an updated test project",
            "categories": ["Technology", "Design", "Art"]
        }
        
        res = self.client().put(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=updated_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify the update
        get_res = self.client().get(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        get_result = json.loads(get_res.data)
        self.assertEqual(get_result['project']['title'], updated_data['title'])
        self.assertEqual(get_result['project']['description'], updated_data['description'])
        self.assertEqual(get_result['project']['categories'], updated_data['categories'])
    
    def test_favorite_project(self):
        """Test favoriting a project"""
        # First create a project with user1
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Favorite the project with user2
        res = self.client().post(
            f'/api/project/{project_id}/favorite',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertTrue(result['is_favorited'])
        
        # Check favorites list
        get_favs_res = self.client().get(
            '/api/project/favorites',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        get_favs_result = json.loads(get_favs_res.data)
        self.assertTrue(any(fav['id'] == project_id for fav in get_favs_result['favorites']))
        
        # Unfavorite the project
        unfav_res = self.client().post(
            f'/api/project/{project_id}/favorite',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        unfav_result = json.loads(unfav_res.data)
        self.assertFalse(unfav_result['is_favorited'])
    
    def test_rate_project(self):
        """Test rating a project"""
        # First create a project with user1
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Rate the project with user2
        rating_data = {
            "rating": 5,
            "feedback": "Great project!"
        }
        
        res = self.client().post(
            f'/api/project/{project_id}/rate',
            headers={"Authorization": f"Bearer {self.user2_token}"},
            json=rating_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertEqual(result['avg_rating'], 5.0)  # First rating should be exactly 5.0
    
    def test_collaboration_request(self):
        """Test sending and accepting a collaboration request"""
        # First create a project with user1
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Send collaboration request from user2
        collab_data = {
            "message": "I would like to collaborate on this project"
        }
        
        res = self.client().post(
            f'/api/project/{project_id}/collaboration-request',
            headers={"Authorization": f"Bearer {self.user2_token}"},
            json=collab_data
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Accept collaboration request as user1
        accept_data = {
            "status": "accepted"
        }
        
        accept_res = self.client().put(
            f'/api/project/{project_id}/collaboration-request/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=accept_data
        )
        self.assertEqual(accept_res.status_code, 200)
        accept_result = json.loads(accept_res.data)
        self.assertTrue(accept_result['status'])
        
        # Verify user2 is now a collaborator
        get_res = self.client().get(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        get_result = json.loads(get_res.data)
        collaborators = [collab['id'] for collab in get_result['project']['collaborators']]
        self.assertIn(self.user2_id, collaborators)
    
    def test_delete_project(self):
        """Test project deletion"""
        # First create a project
        create_res = self.client().post(
            '/api/project/',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=self.project
        )
        create_result = json.loads(create_res.data)
        project_id = create_result['project_id']
        
        # Delete the project
        res = self.client().delete(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Try to get the deleted project
        get_res = self.client().get(
            f'/api/project/{project_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(get_res.status_code, 404)
    
    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            # Clean test database
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
            db.projects.delete_many({"title": {"$in": [self.project["title"], "Updated Test Project"]}})

if __name__ == "__main__":
    unittest.main() 