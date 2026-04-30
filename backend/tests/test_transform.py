import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64"""
    img = Image.new('RGB', (10, 10), color = 'green')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_rotate(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "angle": 45, "interpolation": "bilinear" }
    }
    response = client.post('/api/transform/rotate', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_flip(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "direction": "horizontal" }
    }
    response = client.post('/api/transform/flip', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data

def test_crop(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "x": 2, "y": 2, "width": 5, "height": 5 }
    }
    response = client.post('/api/transform/crop', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['metadata']['width'] == 5
    assert data['metadata']['height'] == 5

def test_resize(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "width": 20, "height": 15 }
    }
    response = client.post('/api/transform/resize', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['metadata']['width'] == 20
    assert data['metadata']['height'] == 15

def test_translate(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "tx": 2, "ty": 3 }
    }
    response = client.post('/api/transform/translate', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True

def test_affine(client):
    test_image = generate_test_image_base64()
    # 2x3 matrix
    payload = {
        "image": test_image,
        "params": { 
            "matrix": [[1, 0.2, 0], [0.1, 1, 0]], 
            "interpolation": "nearest" 
        }
    }
    response = client.post('/api/transform/affine', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
