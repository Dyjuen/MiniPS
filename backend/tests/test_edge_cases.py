import json
import base64
import io
from PIL import Image
import pytest

def generate_test_image_base64(size=(10, 10)):
    """Generate a small image encoded in base64"""
    img = Image.new('RGB', size, color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_missing_image_data(client):
    payload = { "params": {} }
    response = client.post('/api/enhance/brightness', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 400
    assert "No image data provided" in json.loads(response.data)['error']

def test_invalid_base64(client):
    payload = { "image": "not-a-valid-base64-string", "params": {} }
    response = client.post('/api/enhance/brightness', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 500 # Backend throws exception during decode

def test_crop_out_of_bounds(client):
    # 10x10 image, crop 20x20 starting at 5,5
    test_image = generate_test_image_base64((10, 10))
    payload = {
        "image": test_image,
        "params": { "x": 5, "y": 5, "width": 20, "height": 20 }
    }
    response = client.post('/api/transform/crop', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    # Backend should clip to 5x5 result
    assert data['metadata']['width'] == 5
    assert data['metadata']['height'] == 5

def test_resize_zero_dimensions(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "width": 0, "height": 0 }
    }
    response = client.post('/api/transform/resize', 
                            data=json.dumps(payload),
                            content_type='application/json')
    # OpenCV or Pillow usually fails on 0 size
    assert response.status_code == 500

def test_unsupported_convert_format(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "format": "webp" } # webp not in design.md ALLOWED_EXTENSIONS
    }
    response = client.post('/api/image/convert', 
                            data=json.dumps(payload),
                            content_type='application/json')
    # Should fail if we strictly enforce ALLOWED_EXTENSIONS
    assert response.status_code == 500 or response.status_code == 400

def test_grayscale_input_to_rgb_feature(client):
    # Generate grayscale image
    img = Image.new('L', (10, 10), color=128)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    gray_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Feature that expects RGB (e.g., color adjust)
    payload = {
        "image": gray_b64,
        "params": { "hue": 10 }
    }
    response = client.post('/api/color/adjust', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    # Implementation should handle it gracefully (e.g., return as is or convert)
    assert json.loads(response.data)['success'] is True
