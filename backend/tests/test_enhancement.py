import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64"""
    img = Image.new('RGB', (10, 10), color = 'gray')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_brightness_contrast(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "brightness": 20, "contrast": 30 }
    }
    response = client.post('/api/enhance/brightness', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_histogram_eq(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image
    }
    response = client.post('/api/enhance/histogram-eq', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_sharpen(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "intensity": 2 }
    }
    response = client.post('/api/enhance/sharpen', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_smooth(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "kernel_size": 5 }
    }
    response = client.post('/api/enhance/smooth', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data
