"""Tests for Gatekeeper authentication."""
import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_execute_missing_signature():
    """Test execute endpoint rejects requests without DID signature."""
    response = client.post(
        "/execute",
        json={
            "actor_did": "did:key:test",
            "action": "http_request",
            "risk": "low",
            "payload": {},
            "context_hash": "abc123",
        }
    )
    assert response.status_code == 401

def test_execute_invalid_signature():
    """Test execute endpoint rejects requests with invalid signature."""
    response = client.post(
        "/execute",
        json={
            "actor_did": "did:key:test",
            "action": "http_request",
            "risk": "low",
            "payload": {},
            "context_hash": "abc123",
        },
        headers={
            "x-did-sig": "invalid",
            "x-did-pub": "invalid",
        }
    )
    assert response.status_code == 401
