import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64"""
    img = Image.new('RGB', (10, 10), color = 'white')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_gaussian_blur(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "kernel_size": 5, "sigma": 1.5 }
    }
    response = client.post('/api/restore/gaussian', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_median_filter(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "kernel_size": 3 }
    }
    response = client.post('/api/restore/median', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_denoise(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "salt_pepper", "intensity": 0.5 }
    }
    response = client.post('/api/restore/denoise', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data
