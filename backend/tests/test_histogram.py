import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate a small 10x10 RGB image encoded in base64"""
    img = Image.new('RGB', (10, 10), color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_histogram_analyze_grayscale(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "mode": "grayscale" }
    }
    response = client.post('/api/histogram/analyze', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data # This is the chart base64

def test_histogram_analyze_rgb(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "mode": "rgb" }
    }
    response = client.post('/api/histogram/analyze', 
                            data=json.dumps(payload),
                            content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'image' in data
