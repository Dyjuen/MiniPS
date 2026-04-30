from flask import Blueprint, request, jsonify, current_app
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.utils.validators import validate_schema

image_mgmt_bp = Blueprint('image_mgmt', __name__)

@image_mgmt_bp.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    # Enforce design.md constraints
    allowed = list(current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'bmp'}))
    
    schema = {
        'format': {'type': str, 'allowed': allowed, 'default': 'png'},
        'quality': {'type': int, 'min': 1, 'max': 100, 'default': 90}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result_b64 = ndarray_to_base64(img, format=params['format'], quality=params['quality'])
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": img.shape[1], "height": img.shape[0], "format": params['format']}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
