from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.utils.validators import validate_schema
from backend.processing.restore import (
    gaussian_blur, 
    median_filter, 
    denoise_image
)

restoration_bp = Blueprint('restoration', __name__)

@restoration_bp.route('/gaussian', methods=['POST'])
def gaussian():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'kernel_size': {'type': int, 'min': 3, 'max': 15, 'default': 5},
        'sigma': {'type': float, 'min': 0.1, 'max': 5.0, 'default': 1.0}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = gaussian_blur(img, params['kernel_size'], params['sigma'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@restoration_bp.route('/median', methods=['POST'])
def median():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'kernel_size': {'type': int, 'min': 3, 'max': 15, 'default': 3}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = median_filter(img, params['kernel_size'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@restoration_bp.route('/denoise', methods=['POST'])
def denoise():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'method': {'type': str, 'allowed': ['salt_pepper', 'generic'], 'default': 'salt_pepper'},
        'intensity': {'type': float, 'min': 0.1, 'max': 1.0, 'default': 0.5}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = denoise_image(img, params['method'], params['intensity'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
