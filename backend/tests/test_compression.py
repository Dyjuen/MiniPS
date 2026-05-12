import base64
import io
from PIL import Image

def generate_test_image_bytes():
    """Generate small 10x10 RGB image as raw PNG bytes"""
    img = Image.new('RGB', (10, 10), color='cyan')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return buffered.getvalue()

def test_compress_jpeg(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Quality": "50"
    }
    response = client.post('/api/compress/jpeg', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"

def test_compress_encode_rle(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Method": "rle",
        "X-MiniPS-Format": "tiff"
    }
    response = client.post('/api/compress/encode', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/tiff"
    assert "X-MiniPS-Ratio" in response.headers

def test_compress_encode_huffman(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Method": "huffman",
        "X-MiniPS-Format": "png"
    }
    response = client.post('/api/compress/encode', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"

def test_compress_encode_lzw(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Method": "lzw",
        "X-MiniPS-Format": "tiff"
    }
    response = client.post('/api/compress/encode', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/tiff"

def test_compress_encode_arithmetic(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Method": "arithmetic",
        "X-MiniPS-Format": "jpeg"
    }
    response = client.post('/api/compress/encode', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"

def test_compress_encode_quantization(client):
    img_bytes = generate_test_image_bytes()
    headers = {
        "X-MiniPS-Method": "quantization",
        "X-MiniPS-Bits": "4",
        "X-MiniPS-Format": "jpeg"
    }
    response = client.post('/api/compress/encode', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
