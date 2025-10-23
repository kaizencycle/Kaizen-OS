from pathlib import Path
from fastapi import APIRouter, HTTPException
import os, zipfile

router = APIRouter()
DATA_DIR = Path(os.getenv("LEDGER_PATH", "data"))
ARCHIVE_DIR = Path(os.getenv("ARCHIVE_PATH", "archive"))

def _zip_day_folder(date: str) -> str:
    day_dir = DATA_DIR / date
    root_file = DATA_DIR / f"{date}.root.json"  # Root file is in root directory
    if not root_file.exists():
        raise FileNotFoundError(f"Merkle root missing: {root_file}. Seal day first.")

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = ARCHIVE_DIR / f"{date}.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in day_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(DATA_DIR))
    return str(zip_path)

@router.post("/archive/{date}")
def archive_day(date: str):
    try:
        zip_file = _zip_day_folder(date)
        return {"ok": True, "archive_status": "Archive sealed successfully.", "zip_file": zip_file}
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
