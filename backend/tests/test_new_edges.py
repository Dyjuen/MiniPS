import io
from PIL import Image

def generate_test_image_bytes():
    """Generate small 10x10 RGB image as raw PNG bytes"""
    img = Image.new('RGB', (10, 10), color='cyan')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return buffered.getvalue()

def test_edge_canny(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "canny" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"

def test_edge_sobel(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "sobel" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200

def test_edge_prewitt(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "prewitt" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200

def test_edge_roberts(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "roberts" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200

def test_edge_laplacian(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "laplacian" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200

def test_edge_log(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "log" }
    response = client.post('/api/binary/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200

def test_segment_edge_prewitt(client):
    img_bytes = generate_test_image_bytes()
    headers = { "X-MiniPS-Edge-Method": "prewitt" }
    response = client.post('/api/segment/edge', content=img_bytes, headers=headers)
    assert response.status_code == 200
