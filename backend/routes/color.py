from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.color import to_grayscale, split_channels, adjust_color

color_bp = Blueprint('color', __name__)

@color_bp.route('/grayscale', methods=['POST'])
def grayscale():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        result = to_grayscale(img)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@color_bp.route('/channel-split', methods=['POST'])
def channel_split():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    channel = params.get('channel', 'R')
    
    try:
        img = base64_to_ndarray(data['image'])
        result = split_channels(img, channel)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@color_bp.route('/adjust', methods=['POST'])
def adjust():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    hue = params.get('hue', 0)
    saturation = params.get('saturation', 0)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = adjust_color(img, hue, saturation)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
