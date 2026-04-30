import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate small 10x10 grayscale image"""
    img = Image.new('L', (10, 10), color=128)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_binary_threshold(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "value": 127, "method": "binary" }
    }
    response = client.post('/api/binary/threshold', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_binary_edge(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "canny" }
    }
    response = client.post('/api/binary/edge', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_binary_morphology(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "operation": "erosion", "kernel_size": 3 }
    }
    response = client.post('/api/binary/morphology', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True
