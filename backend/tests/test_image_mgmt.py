import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64 (PNG)"""
    img = Image.new('RGB', (10, 10), color = 'blue')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_image_convert_to_jpeg(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "format": "jpeg", "quality": 80 }
    }
    response = client.post('/api/image/convert', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_image_convert_to_bmp(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "format": "bmp" }
    }
    response = client.post('/api/image/convert', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    # BMP conversion might not be supported by my ndarray_to_base64 yet if not careful
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data
