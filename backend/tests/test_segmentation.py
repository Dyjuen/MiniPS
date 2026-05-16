import io
import base64
import json
from PIL import Image

def generate_test_image_bytes():
    """Generate small 10x10 RGB image bytes"""
    img = Image.new('RGB', (10, 10), color='blue')
    # Put a red pixel at 5,5
    img.putpixel((5, 5), (255, 0, 0))
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return buffered.getvalue()

def test_segment_threshold(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Threshold-Value": "100" }
    response = client.post('/api/segment/threshold', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'

def test_segment_edge(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "canny" }
    response = client.post('/api/segment/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'

def test_segment_region_multi_seed(client):
    img_bytes = generate_test_image_bytes()
    seeds = [[2, 2], [5, 5]]
    headers = { 
        "X-MiniPS-Seeds": json.dumps(seeds),
        "X-MiniPS-Tolerance": "10" 
    }
    response = client.post('/api/segment/region', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'

def test_segment_region_auto(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Auto": "true" }
    response = client.post('/api/segment/region', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert 'application/json' in response.headers['content-type']
    data = response.json()
    assert 'params' in data
    assert 'seeds' in data['params']
    assert len(data['params']['seeds']) > 0
