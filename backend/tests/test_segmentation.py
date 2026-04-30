import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate small 10x10 RGB image"""
    img = Image.new('RGB', (10, 10), color='blue')
    # Put a red pixel at 5,5
    img.putpixel((5, 5), (255, 0, 0))
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_segment_threshold(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "value": 100 }
    }
    response = client.post('/api/segment/threshold', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_segment_edge(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "canny" }
    }
    response = client.post('/api/segment/edge', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_segment_region(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "seed_x": 5, "seed_y": 5, "tolerance": 10 }
    }
    response = client.post('/api/segment/region', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True
