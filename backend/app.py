from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

# Import blueprints (to be created)
# from backend.routes.image_mgmt import image_mgmt_bp
# from backend.routes.enhancement import enhancement_bp
# ... etc

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "MiniPS API is running"})

    # Register Blueprints
    # app.register_blueprint(image_mgmt_bp, url_prefix='/api/image')
    # app.register_blueprint(enhancement_bp, url_prefix='/api/enhance')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
