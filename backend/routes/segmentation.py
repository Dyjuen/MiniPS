from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.segment import (
    segment_by_threshold, segment_by_edge, segment_by_region
)

segmentation_bp = Blueprint('segmentation', __name__)

@segmentation_bp.route('/threshold', methods=['POST'])
def threshold():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    value = params.get('value', 127)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_threshold(img, value)
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
    
    params = data.get('params', {})
    method = params.get('method', 'canny')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_edge(img, method)
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
    
    params = data.get('params', {})
    seed_x = params.get('seed_x')
    seed_y = params.get('seed_y')
    tolerance = params.get('tolerance', 10)
    
    if seed_x is None or seed_y is None:
        return jsonify({"success": False, "error": "Seed points (seed_x, seed_y) required"}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = segment_by_region(img, seed_x, seed_y, tolerance)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
