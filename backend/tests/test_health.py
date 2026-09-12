from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "NEPSE Sathi API"

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
    assert data["success"] is True
    assert "snapshot" in data

def test_market_status_endpoint():
    response = client.get("/api/v1/market/status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "status_label" in data
    assert "reason" in data
    assert "next_open_human" in data

def test_market_chart_endpoint():
    response = client.get("/api/v1/market/chart?timeframe=1D")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "points" in data
    assert len(data["points"]) > 0
