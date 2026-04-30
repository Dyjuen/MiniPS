from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.utils.validators import validate_schema
from backend.processing.segment import (
    segment_by_threshold, 
    segment_by_edge, 
    segment_by_region
)

segmentation_bp = Blueprint('segmentation', __name__)

@segmentation_bp.route('/threshold', methods=['POST'])
def threshold():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'value': {'type': int, 'min': 0, 'max': 255, 'default': 127}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_threshold(img, params['value'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@segmentation_bp.route('/edge', methods=['POST'])
def edge():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'method': {'type': str, 'allowed': ['canny', 'sobel'], 'default': 'canny'}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_edge(img, params['method'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@segmentation_bp.route('/region', methods=['POST'])
def region():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'seed_x': {'type': int, 'required': True},
        'seed_y': {'type': int, 'required': True},
        'tolerance': {'type': int, 'min': 0, 'max': 100, 'default': 10}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_region(img, params['seed_x'], params['seed_y'], params['tolerance'])
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
