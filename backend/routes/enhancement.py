from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.enhance import (
    adjust_brightness_contrast, 
    histogram_equalization, 
    sharpen_image, 
    smooth_image
)

enhancement_bp = Blueprint('enhancement', __name__)

@enhancement_bp.route('/brightness', methods=['POST'])
def brightness():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    brightness = params.get('brightness', 0)
    contrast = params.get('contrast', 0)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = adjust_brightness_contrast(img, brightness, contrast)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@enhancement_bp.route('/histogram-eq', methods=['POST'])
def histogram_eq():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = histogram_equalization(img)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@enhancement_bp.route('/sharpen', methods=['POST'])
def sharpen():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    intensity = params.get('intensity', 1)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = sharpen_image(img, intensity)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@enhancement_bp.route('/smooth', methods=['POST'])
def smooth():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    kernel_size = params.get('kernel_size', 3)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = smooth_image(img, kernel_size)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
