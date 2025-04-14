import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run app in debug mode during development
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    # Run app
    app.run(host='0.0.0.0', port=port, debug=debug) 