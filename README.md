# LinkedIn Clone Backend

A Flask-based RESTful API backend for a LinkedIn clone with features for profiles, projects, messaging, and more.

## Features

- **Authentication**
  - Register with email and phone verification
  - Login with JWT token
  - Password reset with verification code

- **Profiles**
  - Multiple user types (Public Figure, Fashion & Beauty, Company, Industry Expert)
  - Profile pictures and social media links
  - Onboarding with custom questions
  - Favoriting users

- **Projects**
  - Create and manage projects with images
  - Rate projects with 5-star system
  - Send collaboration requests
  - Make projects private
  - Categorize projects

- **Messaging**
  - Chat with users within your circle
  - Project proposals
  - Collaboration requests
  - Support messages

- **Settings**
  - Update email, phone, and password
  - Toggle "open to more" setting

## Setup

### Prerequisites

- Python 3.8+
- MongoDB
- Virtual environment (recommended)

### Installation

1. Clone this repository
   ```
   git clone <repository-url>
   cd linkedin-clone-backend
   ```

2. Create a virtual environment and activate it
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Create a .env file from the example
   ```
   cp .env.example .env
   ```

5. Edit the .env file with your settings
   - Generate secure random keys for SECRET_KEY and JWT_SECRET_KEY
   - Configure your MongoDB connection string
   - Add Twilio credentials for SMS (if using)
   - Add SMTP settings for email (if using)

### Running the Application

Development mode:
```
python run.py
```

The API will be available at http://localhost:5000/

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/verify/email` - Verify email with code
- `POST /api/auth/verify/phone` - Verify phone with code
- `POST /api/auth/password/reset-request` - Request a password reset
- `POST /api/auth/password/verify-code` - Verify password reset code
- `POST /api/auth/password/reset` - Reset password
- `GET /api/auth/me` - Get current user info

### Profiles
- `GET /api/profile/` - Get current user profile
- `GET /api/profile/<user_id>` - Get another user's profile
- `POST /api/profile/onboarding` - Update onboarding responses
- `PUT /api/profile/update` - Update profile details
- `POST /api/profile/profile-picture` - Upload profile picture
- `POST /api/profile/favorite/<user_id>` - Favorite/unfavorite a user
- `GET /api/profile/favorites/users` - Get favorited users
- `POST /api/profile/collaboration-request/<user_id>` - Send a collaboration request
- `POST /api/profile/project-proposal/<user_id>` - Send a project proposal

### Projects
- `POST /api/project/` - Create a new project
- `GET /api/project/<project_id>` - Get a project by ID
- `PUT /api/project/<project_id>` - Update a project
- `POST /api/project/<project_id>/images` - Upload project images
- `DELETE /api/project/<project_id>/images/<image_index>` - Delete a project image
- `POST /api/project/<project_id>/favorite` - Favorite/unfavorite a project
- `GET /api/project/favorites` - Get favorited projects
- `POST /api/project/<project_id>/rate` - Rate a project
- `POST /api/project/<project_id>/collaboration-request` - Send a collaboration request
- `PUT /api/project/<project_id>/collaboration-request/<user_id>` - Update collaboration request
- `DELETE /api/project/<project_id>` - Delete a project
- `GET /api/project/user/<user_id>` - Get projects by user
- `GET /api/project/categories` - Get projects by categories

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversations/<conversation_id>` - Get messages in a conversation
- `POST /api/messages/send/<user_id>` - Send a message
- `GET /api/messages/unread/count` - Get unread message count
- `POST /api/messages/mark-read/<message_id>` - Mark a message as read
- `POST /api/messages/mark-conversation-read/<conversation_id>` - Mark all messages in a conversation as read

### Settings
- `PUT /api/settings/email` - Update email
- `PUT /api/settings/phone` - Update phone
- `PUT /api/settings/password` - Update password
- `PUT /api/settings/open-to-more` - Update "open to more" setting

## License

[MIT License](LICENSE) 