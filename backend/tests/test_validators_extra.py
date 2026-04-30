import json
import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_brightness_validation_range(client):
    # Invalid brightness (out of range)
    payload = {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "params": { "brightness": 200 }
    }
    response = client.post('/api/enhance/brightness',
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Parameter brightness must be at most 100" in data['error']

def test_brightness_validation_type(client):
    # Invalid brightness (wrong type)
    payload = {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "params": { "brightness": "not_a_number" }
    }
    response = client.post('/api/enhance/brightness',
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Parameter brightness must be of type int" in data['error']

def test_rotate_validation_enum(client):
    # Invalid interpolation
    payload = {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "params": { "angle": 45, "interpolation": "invalid_method" }
    }
    response = client.post('/api/transform/rotate',
                            data=json.dumps(payload),
                            content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Invalid value for interpolation" in data['error']
