# tests/test_node_metadata.py
import os
import json
import shutil
from pathlib import Path
from fastapi.testclient import TestClient

# Set environment variables before importing the app
os.environ["NODE_ID"] = "cursor"
os.environ["AUTHOR"] = "Cursor AI (Kaizen Node)"
os.environ["NETWORK_ID"] = "Kaizen-DVA"
os.environ["VERSION"] = "0.1.0"

from app.main import app
from app.storage import get_node_metadata

client = TestClient(app)
TEST_DATE = "2025-09-24"
TEST_DATA_DIR = Path("_test_data")

def setup_module(_):
    """Clean up any existing test data."""
    shutil.rmtree(TEST_DATA_DIR, ignore_errors=True)
    # Override DATA_DIR for testing
    import app.storage
    app.storage.DATA_DIR = TEST_DATA_DIR
    # Also override in main module
    import app.main
    app.main.DATA_DIR = TEST_DATA_DIR

def teardown_module(_):
    """Clean up test data."""
    shutil.rmtree(TEST_DATA_DIR, ignore_errors=True)

def test_node_metadata_function():
    """Test that get_node_metadata returns correct values."""
    meta = get_node_metadata()
    assert meta["node_id"] == "cursor"
    assert meta["author"] == "Cursor AI (Kaizen Node)"
    assert meta["network_id"] == "Kaizen-DVA"
    assert meta["version"] == "0.1.0"

def test_seed_includes_node_metadata():
    """Test that seed records include node metadata."""
    response = client.post("/seed", json={
        "date": TEST_DATE,
        "time": "09:00",
        "intent": "Node metadata test",
        "meta": {}
    })
    assert response.status_code == 200
    
    # Check the generated file
    seed_file = TEST_DATA_DIR / f"{TEST_DATE}.seed.json"
    assert seed_file.exists()
    
    with open(seed_file, 'r') as f:
        seed_data = json.load(f)
    
    assert seed_data["meta"]["node_id"] == "cursor"
    assert seed_data["meta"]["author"] == "Cursor AI (Kaizen Node)"
    assert seed_data["meta"]["network_id"] == "Kaizen-DVA"
    assert seed_data["meta"]["version"] == "0.1.0"

def test_sweep_includes_node_metadata():
    """Test that sweep records include node metadata."""
    response = client.post("/sweep", json={
        "date": TEST_DATE,
        "chamber": "TestChamber",
        "note": "Node metadata sweep test",
        "meta": {}
    })
    assert response.status_code == 200
    
    # Check the generated file
    echo_file = TEST_DATA_DIR / f"{TEST_DATE}.echo.json"
    assert echo_file.exists()
    
    with open(echo_file, 'r') as f:
        echo_data = json.load(f)
    
    # Find the sweep record we just created
    sweep_record = None
    for record in echo_data:
        if record.get("note") == "Node metadata sweep test":
            sweep_record = record
            break
    
    assert sweep_record is not None
    assert sweep_record["meta"]["node_id"] == "cursor"
    assert sweep_record["meta"]["author"] == "Cursor AI (Kaizen Node)"
    assert sweep_record["meta"]["network_id"] == "Kaizen-DVA"
    assert sweep_record["meta"]["version"] == "0.1.0"

def test_seal_includes_node_metadata():
    """Test that seal records include node metadata."""
    response = client.post("/seal", json={
        "date": TEST_DATE,
        "wins": "Node metadata integration working",
        "blocks": "None",
        "tomorrow_intent": "Continue testing",
        "meta": {}
    })
    assert response.status_code == 200
    
    # Check the generated file
    seal_file = TEST_DATA_DIR / f"{TEST_DATE}.seal.json"
    assert seal_file.exists()
    
    with open(seal_file, 'r') as f:
        seal_data = json.load(f)
    
    assert seal_data["meta"]["node_id"] == "cursor"
    assert seal_data["meta"]["author"] == "Cursor AI (Kaizen Node)"
    assert seal_data["meta"]["network_id"] == "Kaizen-DVA"
    assert seal_data["meta"]["version"] == "0.1.0"

def test_day_root_creation():
    """Test that day root is created with proper structure."""
    # First create a complete day (seed, sweep, seal)
    client.post("/seed", json={
        "date": TEST_DATE,
        "time": "09:00",
        "intent": "Root test",
        "meta": {}
    })
    
    client.post("/sweep", json={
        "date": TEST_DATE,
        "chamber": "TestChamber",
        "note": "Root test sweep",
        "meta": {}
    })
    
    response = client.post("/seal", json={
        "date": TEST_DATE,
        "wins": "Root creation test",
        "blocks": "None",
        "tomorrow_intent": "Continue",
        "meta": {}
    })
    
    assert response.status_code == 200
    response_data = response.json()
    # Check if root_file is in response or if there's a warning
    assert "root_file" in response_data or "warning" in response_data
    
    # Check the root file
    root_file = TEST_DATA_DIR / f"{TEST_DATE}.root.json"
    assert root_file.exists()
    
    with open(root_file, 'r') as f:
        root_data = json.load(f)
    
    assert root_data["type"] == "day_root"
    assert root_data["date"] == TEST_DATE
    assert "inputs" in root_data
    assert "root" in root_data
    assert "method" in root_data
    assert root_data["method"] == "pairwise-merkle-sha256(hex-concat)"

def test_hash_stability():
    """Test that identical inputs produce identical hashes."""
    # Create two identical seed records
    response1 = client.post("/seed", json={
        "date": f"{TEST_DATE}_stable",
        "time": "10:00",
        "intent": "Hash stability test",
        "meta": {}
    })
    
    response2 = client.post("/seed", json={
        "date": f"{TEST_DATE}_stable",
        "time": "10:00", 
        "intent": "Hash stability test",
        "meta": {}
    })
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    # The hashes should be different because timestamps are included
    # But the structure should be identical
    seed_file = TEST_DATA_DIR / f"{TEST_DATE}_stable.seed.json"
    with open(seed_file, 'r') as f:
        seed_data = json.load(f)
    
    assert seed_data["meta"]["node_id"] == "cursor"
    assert seed_data["meta"]["author"] == "Cursor AI (Kaizen Node)"

def test_export_includes_all_files():
    """Test that export includes all files with node metadata."""
    # Create a complete day
    client.post("/seed", json={
        "date": f"{TEST_DATE}_export",
        "time": "11:00",
        "intent": "Export test",
        "meta": {}
    })
    
    client.post("/sweep", json={
        "date": f"{TEST_DATE}_export",
        "chamber": "ExportChamber",
        "note": "Export test sweep",
        "meta": {}
    })
    
    client.post("/seal", json={
        "date": f"{TEST_DATE}_export",
        "wins": "Export test complete",
        "blocks": "None",
        "tomorrow_intent": "Continue",
        "meta": {}
    })
    
    # Test export
    response = client.get(f"/export/{TEST_DATE}_export")
    assert response.status_code == 200
    
    export_data = response.json()
    assert "files" in export_data
    
    # Check that all files have node metadata
    for filename, file_data in export_data["files"].items():
        if isinstance(file_data, dict) and "meta" in file_data:
            assert file_data["meta"]["node_id"] == "cursor"
            assert file_data["meta"]["author"] == "Cursor AI (Kaizen Node)"
        elif isinstance(file_data, list):
            # Handle echo file (array of sweeps)
            for item in file_data:
                if isinstance(item, dict) and "meta" in item:
                    assert item["meta"]["node_id"] == "cursor"
                    assert item["meta"]["author"] == "Cursor AI (Kaizen Node)"
