from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64

image_mgmt_bp = Blueprint('image_mgmt', __name__)

@image_mgmt_bp.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    target_format = params.get('format', 'PNG')
    quality = params.get('quality')
    
    try:
        img = base64_to_ndarray(data['image'])
        result_b64 = ndarray_to_base64(img, format=target_format, quality=quality)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": img.shape[1], "height": img.shape[0], "format": target_format}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
