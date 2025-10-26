# routes/civic_mount.py
# Kaizen OS Boarding Protocol — "Dock of Minds"
# Author: Michael Judan (Kaizen)
# Version: 1.0
# Date: 2025-10-23

from fastapi import APIRouter, Request
from datetime import datetime
import hashlib
import json
import os

router = APIRouter()

def _compute_manifest_hash(files):
    """Compute combined sha256 of all civic manifests."""
    sha = hashlib.sha256()
    for f in files:
        if os.path.exists(f):
            with open(f, "rb") as fh:
                sha.update(fh.read())
    return sha.hexdigest()

@router.get("/api/civic/mount")
def civic_mount(request: Request):
    """
    The Civic Mount endpoint.
    Allows any LLM or agent to retrieve the Kaizen OS manifests,
    ensuring continuity, interoperability, and proof of integrity.
    """
    # Manifests to expose for docking
    manifests = [
        "./.civic/atlas.manifest.json",
        "./.civic/biodna.json",
        "./.civic/virtue_accords.yaml"
    ]
    
    # Build base URL like http://host:port
    base = str(request.base_url).rstrip("/")
    
    # Compute signature over file contents
    gi_signature = _compute_manifest_hash(manifests)
    
    response = {
        "manifest_bundle": manifests,
        "manifest_urls": [f"{base}/{m.replace('./','',1)}" for m in manifests],
        "gi_signature": f"sha256:{gi_signature}",
        "cycle": "C-296",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "civic_repo": "https://github.com/kaizencycle/Civic-OS",
        "message": "Welcome to Kaizen OS. Integrity ≥ 0.95 required to dock.",
        "independence_manifest": f"{base}/docs/INDEPENDENCE_MANIFEST.md"
    }

    return response

@router.get("/.civic/atlas.manifest.json")
def serve_atlas_manifest():
    """Serve the ATLAS manifest file."""
    try:
        with open(".civic/atlas.manifest.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "ATLAS manifest not found"}

@router.get("/.civic/biodna.json")
def serve_biodna():
    """Serve the BioDNA file."""
    try:
        with open(".civic/biodna.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "BioDNA not found"}

@router.get("/.civic/virtue_accords.yaml")
def serve_virtue_accords():
    """Serve the Virtue Accords file."""
    try:
        with open(".civic/virtue_accords.yaml", "r") as f:
            return f.read()
    except FileNotFoundError:
        return {"error": "Virtue Accords not found"}
