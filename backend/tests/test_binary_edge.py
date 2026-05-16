import io
import base64
import json
from PIL import Image

def generate_test_image_bytes():
    """Generate small 10x10 grayscale image bytes"""
    img = Image.new('L', (10, 10), color=128)
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return buffered.getvalue()

def test_binary_threshold(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Threshold-Value": "127",
        "X-MiniPS-Threshold-Method": "binary"
    }
    response = client.post('/api/binary/threshold', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'

def test_binary_threshold_auto(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Auto": "true"
    }
    response = client.post('/api/binary/threshold', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert 'application/json' in response.headers['content-type']
    data = response.json()
    assert 'image' in data
    assert 'params' in data
    assert 'value' in data['params']

def test_binary_edge_canny(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Edge-Method": "canny",
        "X-MiniPS-Edge-Low": "50",
        "X-MiniPS-Edge-High": "150"
    }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'

def test_binary_edge_auto(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Edge-Method": "canny",
        "X-MiniPS-Auto": "true"
    }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert 'application/json' in response.headers['content-type']
    data = response.json()
    assert 'params' in data
    assert 'low_threshold' in data['params']

def test_binary_morphology(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Morph-Op": "erosion",
        "X-MiniPS-Morph-Kernel": "3"
    }
    response = client.post('/api/binary/morphology', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'image/jpeg'
