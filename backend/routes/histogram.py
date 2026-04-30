from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray
from backend.processing.histogram import get_histogram_chart

histogram_bp = Blueprint('histogram', __name__)

@histogram_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    params = data.get('params', {})
    mode = params.get('mode', 'grayscale')
    
    try:
        img = base64_to_ndarray(data['image'])
        chart_b64 = get_histogram_chart(img, mode)
        return jsonify({
            "success": True, 
            "image": chart_b64
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
