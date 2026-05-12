import pytest
import sys
import os

# Add project root to sys.path to allow imports from backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as client:
        yield client
