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
    
    # Determine if we're in development or production
    env = os.environ.get('FLASK_ENV', 'development')
    print(f"Environment: {env}")
    debug = env == 'development'
    
    if debug:
        # Use Flask's built-in server for development
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        # Use Waitress for production on Windows
        from waitress import serve
        print(f"Serving on http://0.0.0.0:{port}")
        serve(app, host='0.0.0.0', port=port, threads=4) 