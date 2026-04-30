import pytest
import sys
import os

# Add project root to sys.path to allow imports from backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture
def client(app):
    return app.test_client()
