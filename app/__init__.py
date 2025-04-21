import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app)
    
    # Configure app
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'),
        MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://localhost:27017/linkedin_clone'),
        UPLOAD_FOLDER=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'),
    )
    
    # Override with test config if provided
    if test_config is not None:
        # Use a separate test database to avoid conflicts
        app.config['MONGO_URI'] = os.environ.get('TEST_MONGO_URI', 'mongodb://localhost:27017/linkedin_clone_test')
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Register blueprints
    from app.api.routes.auth import auth_bp
    from app.api.routes.profile import profile_bp
    from app.api.routes.project import project_bp
    from app.api.routes.message import message_bp
    from app.api.routes.settings import settings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(project_bp, url_prefix='/api/project')
    app.register_blueprint(message_bp, url_prefix='/api/message')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    
    # Create required directories for uploads if they don't exist
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'projects'), exist_ok=True)
    
    # Create static directory if it doesn't exist
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/.next')
    os.makedirs(static_folder, exist_ok=True)
    
    # Serve static files from the root route
    @app.route('/', defaults={'path': 'server/pages/index.html'})
    @app.route('/<path:path>')
    def serve_static(path):
        return send_from_directory(static_folder, path)

    # Serve public images or other public assets
    @app.route('/images/<path:filename>')
    def serve_public_images(filename):
        public_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/images')
        return send_from_directory(public_folder, filename)
    
    # Add route specifically for Next.js static files
    @app.route('/_next/<path:path>')
    def serve_next_static(path):
        return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/.next'), path)
    
    return app 