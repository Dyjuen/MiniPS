from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.utils.validators import validate_schema
from backend.processing.transform import (
    rotate_image, flip_image, crop_image, 
    resize_image, translate_image, affine_transform
)

transform_bp = Blueprint('transform', __name__)

@transform_bp.route('/rotate', methods=['POST'])
def rotate():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'angle': {'type': float, 'min': 0, 'max': 360, 'default': 0.0},
        'interpolation': {'type': str, 'allowed': ['nearest', 'bilinear'], 'default': 'bilinear'}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = rotate_image(img, params['angle'], params['interpolation'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@transform_bp.route('/flip', methods=['POST'])
def flip():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'direction': {'type': str, 'allowed': ['horizontal', 'vertical'], 'default': 'horizontal'}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = flip_image(img, params['direction'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@transform_bp.route('/crop', methods=['POST'])
def crop():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'x': {'type': int, 'required': True},
        'y': {'type': int, 'required': True},
        'width': {'type': int, 'required': True},
        'height': {'type': int, 'required': True}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = crop_image(img, params['x'], params['y'], params['width'], params['height'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@transform_bp.route('/resize', methods=['POST'])
def resize():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'width': {'type': int, 'required': True},
        'height': {'type': int, 'required': True},
        'interpolation': {'type': str, 'allowed': ['nearest', 'bilinear'], 'default': 'bilinear'}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = resize_image(img, params['width'], params['height'], params['interpolation'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@transform_bp.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'tx': {'type': int, 'default': 0},
        'ty': {'type': int, 'default': 0}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = translate_image(img, params['tx'], params['ty'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@transform_bp.route('/affine', methods=['POST'])
def affine():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params_data = data.get('params', {})
    if 'matrix' not in params_data:
        return jsonify({"success": False, "error": "Missing required parameter: matrix"}), 400
        
    schema = {
        'interpolation': {'type': str, 'allowed': ['nearest', 'bilinear'], 'default': 'bilinear'}
    }
    is_valid, params, err = validate_schema(params_data, schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = affine_transform(img, params_data['matrix'], params['interpolation'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
