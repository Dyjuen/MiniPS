import json
import base64
import io
from PIL import Image
import numpy as np

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64"""
    img = Image.new('RGB', (10, 10), color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_grayscale(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image
    }
    response = client.post('/api/color/grayscale', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_channel_split(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "channel": "R" }
    }
    response = client.post('/api/color/channel-split', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_color_adjust(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "hue": 10, "saturation": 20 }
    }
    response = client.post('/api/color/adjust', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data
