import os
from flask import Blueprint, request, jsonify, current_app
from app.api.models.project import Project
from app.api.models.user import User
from app.api.middlewares.auth_middleware import token_required, requires_verification
from werkzeug.utils import secure_filename

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['POST'])
@token_required
@requires_verification
def create_project(current_user):
    """Create a new project"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({"status": False, "message": f"Missing required field: {field}"}), 400
    
    # Create project
    project = Project(
        user_id=current_user._id,
        title=data['title'],
        description=data['description'],
        categories=data.get('categories', []),
        budget=data.get('budget'),
        is_private=data.get('is_private', False)
    )
    
    project_id = project.save()
    
    return jsonify({
        "status": True,
        "message": "Project created successfully",
        "project_id": project_id
    }), 201

@project_bp.route('/<project_id>', methods=['GET'])
@token_required
def get_project(current_user, project_id):
    """Get a project by ID"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user has access to private project
    if project.is_private and project.user_id != current_user._id and current_user._id not in project.collaborators:
        return jsonify({"status": False, "message": "You don't have access to this project"}), 403
    
    # Check if project is in user's favorites
    is_favorited = project_id in current_user.favorites['projects']
    
    # Get project owner
    owner = User.find_by_id(project.user_id)
    owner_info = {
        "id": owner._id,
        "username": owner.username,
        "user_type": owner.user_type,
        "profile_picture": owner.profile_picture
    } if owner else {"id": project.user_id, "username": "Unknown User"}
    
    # Get collaborators
    collaborators = []
    for collab_id in project.collaborators:
        collab = User.find_by_id(collab_id)
        if collab:
            collaborators.append({
                "id": collab._id,
                "username": collab.username,
                "user_type": collab.user_type,
                "profile_picture": collab.profile_picture
            })
    
    return jsonify({
        "status": True,
        "project": {
            "id": project._id,
            "title": project.title,
            "description": project.description,
            "images": project.images,
            "categories": project.categories,
            "budget": project.budget,
            "is_private": project.is_private,
            "owner": owner_info,
            "collaborators": collaborators,
            "favorites_count": project.favorites_count,
            "avg_rating": project.avg_rating,
            "is_owner": project.user_id == current_user._id,
            "is_collaborator": current_user._id in project.collaborators,
            "is_favorited": is_favorited,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
    }), 200

@project_bp.route('/<project_id>', methods=['PUT'])
@token_required
@requires_verification
def update_project(current_user, project_id):
    """Update a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner or a collaborator
    if project.user_id != current_user._id and current_user._id not in project.collaborators:
        return jsonify({"status": False, "message": "You don't have permission to update this project"}), 403
    
    data = request.get_json()
    
    # Fields that can be updated
    allowed_fields = ['title', 'description', 'categories', 'budget', 'is_private']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({
            "status": False,
            "message": "No valid fields to update"
        }), 400
    
    # Update project
    project.update(update_data)
    
    return jsonify({
        "status": True,
        "message": "Project updated successfully"
    }), 200

@project_bp.route('/<project_id>/images', methods=['POST'])
@token_required
@requires_verification
def upload_project_images(current_user, project_id):
    """Upload images for a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner or a collaborator
    if project.user_id != current_user._id and current_user._id not in project.collaborators:
        return jsonify({"status": False, "message": "You don't have permission to update this project"}), 403
    
    if 'files' not in request.files:
        return jsonify({"status": False, "message": "No files provided"}), 400
    
    files = request.files.getlist('files')
    
    if not files or files[0].filename == '':
        return jsonify({"status": False, "message": "No files selected"}), 400
    
    # Validate file types and save
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    uploaded_files = []
    
    for file in files:
        if file and '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
            # Create a secure filename
            filename = secure_filename(f"{project._id}_{len(project.images)}_{file.filename}")
            
            # Save file
            project_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'projects')
            file_path = os.path.join(project_dir, filename)
            file.save(file_path)
            
            # Add to project images
            image_url = f"/projects/{filename}"
            project.images.append(image_url)
            uploaded_files.append(image_url)
    
    if uploaded_files:
        project.save()
        return jsonify({
            "status": True,
            "message": f"{len(uploaded_files)} images uploaded successfully",
            "images": uploaded_files
        }), 200
    else:
        return jsonify({"status": False, "message": "No valid images to upload"}), 400

@project_bp.route('/<project_id>/images/<int:image_index>', methods=['DELETE'])
@token_required
@requires_verification
def delete_project_image(current_user, project_id, image_index):
    """Delete an image from a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner
    if project.user_id != current_user._id:
        return jsonify({"status": False, "message": "Only the project owner can delete images"}), 403
    
    if image_index < 0 or image_index >= len(project.images):
        return jsonify({"status": False, "message": "Invalid image index"}), 400
    
    # Get the image URL and remove from project
    image_url = project.images.pop(image_index)
    project.save()
    
    # TODO: delete the actual file (optional)
    
    return jsonify({
        "status": True,
        "message": "Image deleted successfully"
    }), 200

@project_bp.route('/<project_id>/favorite', methods=['POST'])
@token_required
@requires_verification
def favorite_project(current_user, project_id):
    """Add/remove a project to/from favorites"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Toggle favorite
    if project_id in current_user.favorites['projects']:
        current_user.favorites['projects'].remove(project_id)
        project.favorites_count = max(0, project.favorites_count - 1)
        action = "removed from"
    else:
        current_user.favorites['projects'].append(project_id)
        project.favorites_count += 1
        action = "added to"
    
    current_user.save()
    project.save()
    
    return jsonify({
        "status": True,
        "message": f"Project {action} favorites",
        "is_favorited": project_id in current_user.favorites['projects'],
        "favorites_count": project.favorites_count
    }), 200

@project_bp.route('/favorites', methods=['GET'])
@token_required
@requires_verification
def get_favorite_projects(current_user):
    """Get user's favorite projects"""
    favorite_projects = []
    
    for project_id in current_user.favorites['projects']:
        project = Project.find_by_id(project_id)
        if project and not project.is_private:
            # Get owner
            owner = User.find_by_id(project.user_id)
            owner_info = {
                "id": owner._id,
                "username": owner.username
            } if owner else {"id": project.user_id, "username": "Unknown User"}
            
            favorite_projects.append({
                "id": project._id,
                "title": project.title,
                "description": project.description,
                "images": project.images[:1] if project.images else [],
                "categories": project.categories,
                "owner": owner_info,
                "avg_rating": project.avg_rating
            })
    
    return jsonify({
        "status": True,
        "favorites": favorite_projects
    }), 200

@project_bp.route('/<project_id>/rate', methods=['POST'])
@token_required
@requires_verification
def rate_project(current_user, project_id):
    """Rate a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner
    if project.user_id == current_user._id:
        return jsonify({"status": False, "message": "You cannot rate your own project"}), 400
    
    data = request.get_json()
    
    if 'rating' not in data:
        return jsonify({"status": False, "message": "Rating is required"}), 400
    
    try:
        rating = int(data['rating'])
    except ValueError:
        return jsonify({"status": False, "message": "Rating must be a number between 1 and 5"}), 400
    
    if not 1 <= rating <= 5:
        return jsonify({"status": False, "message": "Rating must be between 1 and 5"}), 400
    
    # Add rating
    try:
        project.add_rating(
            user_id=current_user._id,
            rating=rating,
            feedback=data.get('feedback')
        )
        
        return jsonify({
            "status": True,
            "message": "Rating submitted successfully",
            "avg_rating": project.avg_rating
        }), 200
    except Exception as e:
        return jsonify({
            "status": False,
            "message": f"Failed to submit rating: {str(e)}"
        }), 500

@project_bp.route('/<project_id>/collaboration-request', methods=['POST'])
@token_required
@requires_verification
def send_project_collaboration_request(current_user, project_id):
    """Send a collaboration request for a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner
    if project.user_id == current_user._id:
        return jsonify({"status": False, "message": "You cannot send a collaboration request to your own project"}), 400
    
    # Check if user is already a collaborator
    if current_user._id in project.collaborators:
        return jsonify({"status": False, "message": "You are already a collaborator on this project"}), 400
    
    # Check for existing request
    for req in project.collaboration_requests:
        if req["user_id"] == current_user._id:
            return jsonify({"status": False, "message": "You have already sent a collaboration request"}), 400
    
    data = request.get_json() or {}
    message = data.get('message', 'I would like to collaborate on this project')
    
    # Add request to project
    project.add_collaboration_request(
        user_id=current_user._id,
        message=message
    )
    
    # Notify the project owner via message
    from app.api.models.message import Message
    
    conversation_id = Message.generate_conversation_id(current_user._id, project.user_id, f"project_{project._id}")
    
    # Create and save the message
    message_obj = Message(
        sender_id=current_user._id,
        receiver_id=project.user_id,
        conversation_id=conversation_id,
        content=f"Collaboration Request: {message}\n\nProject: {project.title}",
        message_type="project_collaboration"
    )
    message_obj.save()
    
    return jsonify({
        "status": True,
        "message": "Collaboration request sent successfully"
    }), 200

@project_bp.route('/<project_id>/collaboration-request/<user_id>', methods=['PUT'])
@token_required
@requires_verification
def update_collaboration_request(current_user, project_id, user_id):
    """Update the status of a collaboration request"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner
    if project.user_id != current_user._id:
        return jsonify({"status": False, "message": "Only the project owner can update collaboration requests"}), 403
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({"status": False, "message": "Status is required"}), 400
    
    status = data['status']
    
    if status not in ['accepted', 'rejected']:
        return jsonify({"status": False, "message": "Status must be 'accepted' or 'rejected'"}), 400
    
    # Update request
    result = project.update_collaboration_request(user_id, status)
    
    if not result:
        return jsonify({"status": False, "message": "Collaboration request not found"}), 404
    
    # Notify the requester via message
    from app.api.models.message import Message
    
    conversation_id = Message.generate_conversation_id(current_user._id, user_id, f"project_{project._id}")
    
    status_text = "accepted" if status == "accepted" else "declined"
    
    # Create and save the message
    message_obj = Message(
        sender_id=current_user._id,
        receiver_id=user_id,
        conversation_id=conversation_id,
        content=f"Your collaboration request for project '{project.title}' has been {status_text}.",
        message_type="project_collaboration"
    )
    message_obj.save()
    
    return jsonify({
        "status": True,
        "message": f"Collaboration request {status}"
    }), 200

@project_bp.route('/<project_id>', methods=['DELETE'])
@token_required
@requires_verification
def delete_project(current_user, project_id):
    """Delete a project"""
    project = Project.find_by_id(project_id)
    
    if not project:
        return jsonify({"status": False, "message": "Project not found"}), 404
    
    # Check if user is the owner
    if project.user_id != current_user._id:
        return jsonify({"status": False, "message": "Only the project owner can delete the project"}), 403
    
    # Delete project
    result = project.delete()
    
    if result:
        return jsonify({
            "status": True,
            "message": "Project deleted successfully"
        }), 200
    else:
        return jsonify({
            "status": False,
            "message": "Failed to delete project"
        }), 500

@project_bp.route('/user/<user_id>', methods=['GET'])
@token_required
def get_user_projects(current_user, user_id):
    """Get projects by user ID"""
    # Determine if we should include private projects
    include_private = user_id == current_user._id
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 10, type=int), 50)  # Maximum 50 per page
    skip = (page - 1) * limit
    
    # Get projects
    projects = Project.find_by_user_id(user_id, skip, limit, include_private)
    
    # Format response
    formatted_projects = []
    for project in projects:
        owner = User.find_by_id(project.user_id)
        owner_info = {
            "id": owner._id,
            "username": owner.username
        } if owner else {"id": project.user_id, "username": "Unknown User"}
        
        formatted_projects.append({
            "id": project._id,
            "title": project.title,
            "description": project.description,
            "images": project.images[:1] if project.images else [],
            "categories": project.categories,
            "budget": project.budget,
            "owner": owner_info,
            "favorites_count": project.favorites_count,
            "avg_rating": project.avg_rating,
            "is_favorited": project._id in current_user.favorites['projects'],
            "created_at": project.created_at
        })
    
    return jsonify({
        "status": True,
        "projects": formatted_projects,
        "page": page,
        "limit": limit
    }), 200

@project_bp.route('/categories', methods=['GET'])
@token_required
def get_projects_by_categories(current_user):
    """Get projects by categories"""
    # Get categories from query parameters
    categories = request.args.getlist('category')
    
    if not categories:
        return jsonify({"status": False, "message": "At least one category is required"}), 400
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 10, type=int), 50)  # Maximum 50 per page
    skip = (page - 1) * limit
    
    # Get projects
    projects = Project.find_by_categories(categories, skip, limit)
    
    # Format response
    formatted_projects = []
    for project in projects:
        owner = User.find_by_id(project.user_id)
        owner_info = {
            "id": owner._id,
            "username": owner.username
        } if owner else {"id": project.user_id, "username": "Unknown User"}
        
        formatted_projects.append({
            "id": project._id,
            "title": project.title,
            "description": project.description,
            "images": project.images[:1] if project.images else [],
            "categories": project.categories,
            "owner": owner_info,
            "favorites_count": project.favorites_count,
            "avg_rating": project.avg_rating,
            "is_favorited": project._id in current_user.favorites['projects'],
            "created_at": project.created_at
        })
    
    return jsonify({
        "status": True,
        "projects": formatted_projects,
        "categories": categories,
        "page": page,
        "limit": limit
    }), 200 