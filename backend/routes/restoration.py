from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.restore import gaussian_blur, median_filter, denoise_image

restoration_bp = Blueprint('restoration', __name__)

@restoration_bp.route('/gaussian', methods=['POST'])
def gaussian():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    k_size = params.get('kernel_size', 5)
    sigma = params.get('sigma', 1.0)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = gaussian_blur(img, k_size, sigma)
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
    
    params = data.get('params', {})
    k_size = params.get('kernel_size', 3)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = median_filter(img, k_size)
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
    
    params = data.get('params', {})
    method = params.get('method', 'salt_pepper')
    intensity = params.get('intensity', 0.5)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = denoise_image(img, method, intensity)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
