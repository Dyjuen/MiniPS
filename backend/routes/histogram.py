from flask import Blueprint, request, jsonify
from backend.utils.image_utils import base64_to_ndarray
from backend.utils.validators import validate_schema
from backend.processing.histogram import get_histogram_chart

histogram_bp = Blueprint('histogram', __name__)

@histogram_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400
    
    schema = {
        'mode': {'type': str, 'allowed': ['grayscale', 'rgb'], 'default': 'grayscale'}
    }
    is_valid, params, err = validate_schema(data.get('params', {}), schema)
    if not is_valid:
        return jsonify({"success": False, "error": err}), 400
    
    try:
        img = base64_to_ndarray(data['image'])
        chart_b64 = get_histogram_chart(img, params['mode'])
        return jsonify({
            "success": True, 
            "image": chart_b64
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
