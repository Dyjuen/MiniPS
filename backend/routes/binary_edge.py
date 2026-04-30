from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.binary_edge import apply_threshold, detect_edges, apply_morphology

binary_edge_bp = Blueprint('binary_edge', __name__)

@binary_edge_bp.route('/threshold', methods=['POST'])
def threshold():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    value = params.get('value', 127)
    method = params.get('method', 'binary')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = apply_threshold(img, value, method)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@binary_edge_bp.route('/edge', methods=['POST'])
def edge():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    method = params.get('method', 'canny')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = detect_edges(img, method)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@binary_edge_bp.route('/morphology', methods=['POST'])
def morphology():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    op = params.get('operation', 'erosion')
    k_size = params.get('kernel_size', 3)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = apply_morphology(img, op, k_size)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
