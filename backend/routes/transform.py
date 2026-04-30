from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
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
    
    params = data.get('params', {})
    angle = params.get('angle', 0)
    interp = params.get('interpolation', 'bilinear')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = rotate_image(img, angle, interp)
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
    
    params = data.get('params', {})
    direction = params.get('direction', 'horizontal')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = flip_image(img, direction)
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
    
    params = data.get('params', {})
    x = params.get('x', 0)
    y = params.get('y', 0)
    w = params.get('width', 100)
    h = params.get('height', 100)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = crop_image(img, x, y, w, h)
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
    
    params = data.get('params', {})
    w = params.get('width')
    h = params.get('height')
    interp = params.get('interpolation', 'bilinear')
    
    if w is None or h is None:
        return jsonify({"success": False, "error": "Width and height required"}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = resize_image(img, w, h, interp)
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
    
    params = data.get('params', {})
    tx = params.get('tx', 0)
    ty = params.get('ty', 0)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = translate_image(img, tx, ty)
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
    
    params = data.get('params', {})
    matrix = params.get('matrix')
    interp = params.get('interpolation', 'bilinear')
    
    if matrix is None:
        return jsonify({"success": False, "error": "Matrix required"}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = affine_transform(img, matrix, interp)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
