import json
import base64
import io
from PIL import Image

def generate_test_image_base64():
    """Generate small 10x10 RGB image"""
    img = Image.new('RGB', (10, 10), color='cyan')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def test_compress_jpeg(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "quality": 50 }
    }
    response = client.post('/api/compress/jpeg', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_compress_encode_rle(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "rle" }
    }
    response = client.post('/api/compress/encode', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'compressed_size' in data

def test_compress_encode_huffman(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "huffman" }
    }
    response = client.post('/api/compress/encode', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_compress_encode_lzw(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "lzw" }
    }
    response = client.post('/api/compress/encode', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_compress_encode_arithmetic(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "arithmetic" }
    }
    response = client.post('/api/compress/encode', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True

def test_compress_encode_quantization(client):
    test_image = generate_test_image_base64()
    payload = {
        "image": test_image,
        "params": { "method": "quantization", "bits": 4 }
    }
    response = client.post('/api/compress/encode', 
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.data)['success'] is True
