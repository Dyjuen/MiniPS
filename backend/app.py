from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

# Import blueprints
from backend.routes.image_mgmt import image_mgmt_bp
from backend.routes.enhancement import enhancement_bp
from backend.routes.transform import transform_bp
from backend.routes.restoration import restoration_bp
from backend.routes.binary_edge import binary_edge_bp
from backend.routes.color import color_bp
from backend.routes.segmentation import segmentation_bp
from backend.routes.compression import compression_bp
from backend.routes.histogram import histogram_bp
from backend.routes.ml import ml_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "MiniPS API is running"})

    # Register Blueprints
    app.register_blueprint(image_mgmt_bp, url_prefix='/api/image')
    app.register_blueprint(enhancement_bp, url_prefix='/api/enhance')
    app.register_blueprint(transform_bp, url_prefix='/api/transform')
    app.register_blueprint(restoration_bp, url_prefix='/api/restore')
    app.register_blueprint(binary_edge_bp, url_prefix='/api/binary')
    app.register_blueprint(color_bp, url_prefix='/api/color')
    app.register_blueprint(segmentation_bp, url_prefix='/api/segment')
    app.register_blueprint(compression_bp, url_prefix='/api/compress')
    app.register_blueprint(histogram_bp, url_prefix='/api/histogram')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
