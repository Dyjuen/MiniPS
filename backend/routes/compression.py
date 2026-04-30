from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray, ndarray_to_base64
from backend.processing.compress import compress_jpeg_sim, encode_image

compression_bp = Blueprint('compression', __name__)

@compression_bp.route('/jpeg', methods=['POST'])
def jpeg_sim():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    quality = params.get('quality', 50)
    
    try:
        img = base64_to_ndarray(data['image'])
        result = compress_jpeg_sim(img, quality)
        result_b64 = ndarray_to_base64(result)
        return jsonify({
            "success": True, 
            "image": result_b64,
            "metadata": {"width": result.shape[1], "height": result.shape[0]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@compression_bp.route('/encode', methods=['POST'])
def encode():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    method = params.get('method', 'huffman')
    
    try:
        img = base64_to_ndarray(data['image'])
        res_img, o_size, c_size, ratio = encode_image(img, method, params)
        res_b64 = ndarray_to_base64(res_img)
        return jsonify({
            "success": True, 
            "image": res_b64,
            "original_size": o_size,
            "compressed_size": c_size,
            "ratio": ratio
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
