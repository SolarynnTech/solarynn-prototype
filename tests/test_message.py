import unittest
import json
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import random
import string
from app import create_app
from app.config.database import db
from tests import BaseTestCase

class MessageTestCase(BaseTestCase):
    """Test case for the message routes"""
    
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
            "username": f"messageuser2_{self.unique_id}",
            "email": f"message2_{self.unique_id}@example.com",
            "phone": f"+0987654{self.unique_id[:8]}",
            "password": "Password123",
            "user_type": "Industry Expert"
        }
        
        # Test message content
        self.message_content = "This is a test message"
        
        # Execute all requests in the context of the app
        with self.app.app_context():
            # Clear test database
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
            db.messages.delete_many({"content": self.message_content})
        
        # Register and verify users
        self.user1_id, self.user1_token = self._register_and_verify_user(self.user1)
        self.user2_id, self.user2_token = self._register_and_verify_user(self.user2)
        
    def _register_and_verify_user(self, user_data):
        """Helper to register and verify a user, then return user_id and token"""
        # Register
        res = self.client().post('/api/auth/register', json=user_data)
        result = json.loads(res.data)
        
        # Check if registration was successful
        if res.status_code != 201 or not result.get('status', False):
            print(f"Registration failed for {user_data['username']}: {result}")
            print(f"Status code: {res.status_code}")
            # Try to check if user already exists and get the user ID
            with self.app.app_context():
                existing_user = db.users.find_one({"email": user_data["email"]})
                if existing_user:
                    user_id = str(existing_user.get('_id'))
                    # Proceed with login
                    login_res = self.client().post('/api/auth/login',
                                               json={"email": user_data["email"], 
                                                    "password": user_data["password"]})
                    login_result = json.loads(login_res.data)
                    token = login_result.get('token')
                    return user_id, token
                else:
                    self.fail(f"Registration failed and user does not exist: {result}")
        
        # Registration was successful
        user_id = result.get('user_id')
        email_code = result.get('email_code')
        
        if not user_id or not email_code:
            print(f"Missing user_id or email_code in result: {result}")
            self.fail(f"Registration response missing required fields: {result}")
        
        # Verify email
        verify_res = self.client().post('/api/auth/verify/email',
                                   json={"user_id": user_id, "code": email_code})
        verify_result = json.loads(verify_res.data)
        
        if verify_res.status_code != 200 or not verify_result.get('status', False):
            print(f"Email verification failed: {verify_result}")
            self.fail(f"Email verification failed: {verify_result}")
        
        # Login and get token
        login_res = self.client().post('/api/auth/login',
                                      json={"email": user_data["email"], 
                                           "password": user_data["password"]})
        login_result = json.loads(login_res.data)
        
        if login_res.status_code != 200 or not login_result.get('status', False):
            print(f"Login failed: {login_result}")
            self.fail(f"Login failed: {login_result}")
        
        token = login_result.get('token')
        
        if not token:
            print(f"Token missing from login response: {login_result}")
            self.fail(f"Token missing from login response: {login_result}")
        
        return user_id, token
    
    def test_send_message(self):
        """Test sending a message"""
        message_data = {
            "content": self.message_content
        }
        
        res = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data
        )
        self.assertEqual(res.status_code, 201)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertIn('message_id', result)
        self.assertIn('conversation_id', result)
        
        # Store conversation_id for subsequent tests
        self.conversation_id = result['conversation_id']
    
    def test_send_message_with_context(self):
        """Test sending a message with context"""
        message_data = {
            "content": self.message_content,
            "context": "project_123"  # This will create a separate conversation
        }
        
        res = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data
        )
        self.assertEqual(res.status_code, 201)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertIn('conversation_id', result)
    
    def test_get_conversations(self):
        """Test getting conversations"""
        # First send a message to create a conversation
        message_data = {
            "content": self.message_content
        }
        
        send_res = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data
        )
        send_result = json.loads(send_res.data)
        conversation_id = send_result['conversation_id']
        
        # Get conversations for sender
        res = self.client().get(
            '/api/message/conversations',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertGreaterEqual(len(result['conversations']), 1)
        
        # Verify conversation details
        found_conversation = False
        for conv in result['conversations']:
            if conv['conversation_id'] == conversation_id:
                found_conversation = True
                self.assertEqual(conv['other_user']['id'], self.user2_id)
                self.assertEqual(conv['latest_message']['content'], self.message_content)
                break
        
        self.assertTrue(found_conversation, "Created conversation not found in list")
        
        # Get conversations for recipient
        res2 = self.client().get(
            '/api/message/conversations',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        result2 = json.loads(res2.data)
        self.assertTrue(result2['status'])
        
        # Recipient should also see the conversation
        found_conversation = False
        for conv in result2['conversations']:
            if conv['conversation_id'] == conversation_id:
                found_conversation = True
                self.assertEqual(conv['other_user']['id'], self.user1_id)
                self.assertEqual(conv['latest_message']['content'], self.message_content)
                break
        
        self.assertTrue(found_conversation, "Conversation not found in recipient's list")
    
    def test_get_conversation_messages(self):
        """Test getting messages for a specific conversation"""
        # First send some messages to create a conversation with multiple messages
        message_data1 = {
            "content": self.message_content
        }
        
        send_res1 = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data1
        )
        send_result1 = json.loads(send_res1.data)
        conversation_id = send_result1['conversation_id']
        
        # Send a reply
        message_data2 = {
            "content": "This is a reply message"
        }
        
        self.client().post(
            f'/api/message/send/{self.user1_id}',
            headers={"Authorization": f"Bearer {self.user2_token}"},
            json=message_data2
        )
        
        # Get conversation messages
        res = self.client().get(
            f'/api/message/conversations/{conversation_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify messages
        self.assertEqual(len(result['messages']), 2)
        self.assertEqual(result['messages'][0]['content'], message_data1['content'])
        self.assertEqual(result['messages'][1]['content'], message_data2['content'])
        
        # Verify other user info
        self.assertEqual(result['other_user']['id'], self.user2_id)
        self.assertEqual(result['other_user']['username'], self.user2['username'])
    
    def test_mark_message_as_read(self):
        """Test marking a message as read"""
        # First send a message
        message_data = {
            "content": self.message_content
        }
        
        send_res = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data
        )
        send_result = json.loads(send_res.data)
        message_id = send_result['message_id']
        
        # Mark as read (as recipient)
        res = self.client().post(
            f'/api/message/mark-read/{message_id}',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Verify message is marked as read in conversation view
        conversation_id = send_result['conversation_id']
        get_res = self.client().get(
            f'/api/message/conversations/{conversation_id}',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        get_result = json.loads(get_res.data)
        
        # First message should be marked as read
        self.assertTrue(get_result['messages'][0]['is_read'])
    
    def test_mark_conversation_as_read(self):
        """Test marking an entire conversation as read"""
        # First send multiple messages
        message_data1 = {
            "content": self.message_content
        }
        
        send_res1 = self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data1
        )
        send_result1 = json.loads(send_res1.data)
        conversation_id = send_result1['conversation_id']
        
        # Send another message
        message_data2 = {
            "content": "Second test message"
        }
        
        self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data2
        )
        
        # Mark entire conversation as read (as recipient)
        res = self.client().post(
            f'/api/message/mark-conversation-read/{conversation_id}',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        
        # Get unread count
        unread_res = self.client().get(
            '/api/message/unread/count',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        unread_result = json.loads(unread_res.data)
        
        # There should be zero unread messages from this conversation
        self.assertEqual(unread_result['unread_count'], 0)
    
    def test_unread_count(self):
        """Test getting unread message count"""
        # First send a message
        message_data = {
            "content": self.message_content
        }
        
        self.client().post(
            f'/api/message/send/{self.user2_id}',
            headers={"Authorization": f"Bearer {self.user1_token}"},
            json=message_data
        )
        
        # Get unread count for recipient
        res = self.client().get(
            '/api/message/unread/count',
            headers={"Authorization": f"Bearer {self.user2_token}"}
        )
        self.assertEqual(res.status_code, 200)
        result = json.loads(res.data)
        self.assertTrue(result['status'])
        self.assertGreaterEqual(result['unread_count'], 1)
    
    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            # Clean test database
            db.users.delete_many({"email": {"$in": [self.user1["email"], self.user2["email"]]}})
            db.messages.delete_many({"content": {"$in": [self.message_content, "This is a reply message", "Second test message"]}})

if __name__ == "__main__":
    unittest.main() 