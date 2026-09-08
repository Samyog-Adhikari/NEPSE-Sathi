from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "NEPSE Insight API"

def test_api_v1_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"

def test_market_summary_endpoint():
    response = client.get("/api/v1/market/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "nepse_index" in data["data"]
