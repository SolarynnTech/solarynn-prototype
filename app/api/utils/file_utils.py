import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename, allowed_extensions):
    """Check if a file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_unique_filename(filename):
    """Generate a unique filename to prevent overwriting"""
    # Get file extension
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Create a UUID-based filename
    unique_filename = f"{uuid.uuid4().hex}.{ext}" if ext else f"{uuid.uuid4().hex}"
    
    return unique_filename

def save_file(file, directory, allowed_extensions=None, use_original_name=False):
    """
    Save a file to the specified directory with validation
    
    Parameters:
    - file: FileStorage object
    - directory: Directory to save file in
    - allowed_extensions: Set of allowed file extensions (optional)
    - use_original_name: Whether to use the original filename or generate unique name
    
    Returns:
    - Tuple (success, message, file_path)
    """
    if not file or file.filename == '':
        return False, "No file selected", None
    
    # Check file extension if provided
    if allowed_extensions and not allowed_file(file.filename, allowed_extensions):
        allowed_str = ', '.join(allowed_extensions)
        return False, f"Invalid file type. Allowed types: {allowed_str}", None
    
    # Create directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)
    
    # Generate filename
    if use_original_name:
        filename = secure_filename(file.filename)
    else:
        secure_name = secure_filename(file.filename)
        filename = get_unique_filename(secure_name)
    
    # Save file
    file_path = os.path.join(directory, filename)
    try:
        file.save(file_path)
        # Return relative path from uploads directory
        rel_path = os.path.join(os.path.basename(directory), filename)
        return True, "File saved successfully", rel_path
    except Exception as e:
        return False, f"Error saving file: {str(e)}", None

def delete_file(file_path):
    """Delete a file from the uploads directory"""
    try:
        # Construct full path
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path.lstrip('/'))
        
        # Check if file exists
        if os.path.exists(full_path):
            os.remove(full_path)
            return True, "File deleted successfully"
        else:
            return False, "File not found"
    except Exception as e:
        return False, f"Error deleting file: {str(e)}" 