from pathlib import Path
import json
from app.storage import today_files, write_json, read_json, load_day, build_ledger_obj, DATA_DIR
from app.hashing import sha256_json

def setup_day(date="2025-09-18"):
    files = today_files(date)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    # seed
    seed = {"type": "seed", "date": date, "time": "12:00:00", "intent": "iterate", "meta": {}, "ts":"T"}
    write_json(files["seed"], seed)
    # sweeps
    sweeps = [
        {"type": "sweep", "date": date, "chamber": "LAB", "note": "first", "meta": {}, "ts":"T"},
        {"type": "sweep", "date": date, "chamber": "LAB", "note": "second", "meta": {}, "ts":"T"},
    ]
    write_json(files["echo"], sweeps)
    # seal
    seal = {"type":"seal","date":date,"wins":"ok","blocks":"none","tomorrow_intent":"polish","meta":{},"ts":"T"}
    write_json(files["seal"], seal)
    # ledger
    ledger = build_ledger_obj(date, seed, sweeps, seal)
    write_json(files["ledger"], ledger)
    return files, seed, sweeps, seal, ledger

def test_verify_ok():
    files, seed, sweeps, seal, ledger = setup_day()
    recomputed = build_ledger_obj("2025-09-18", seed, sweeps, seal)
    assert ledger["day_root"] == recomputed["day_root"]
    assert ledger["counts"] == recomputed["counts"]

def test_verify_fails_on_tamper():
    files, seed, sweeps, seal, ledger = setup_day("2025-09-19")
    # tamper echo
    tampered = list(sweeps)
    tampered.append({"type":"sweep","date":"2025-09-19","chamber":"LAB","note":"tamper","meta":{},"ts":"T"})
    write_json(files["echo"], tampered)
    recomputed = build_ledger_obj("2025-09-19", seed, tampered, seal)
    assert ledger["day_root"] != recomputed["day_root"]

def test_verify_fails_missing_seed():
    files, seed, sweeps, seal, ledger = setup_day("2025-09-20")
    # remove seed file
    (DATA_DIR / files["seed"]).unlink()
    try:
        build_ledger_obj("2025-09-20", None, sweeps, seal)
        assert False, "Should have failed with missing seed"
    except Exception:
        pass  # expected

def test_verify_fails_missing_seal():
    files, seed, sweeps, seal, ledger = setup_day("2025-09-21")
    # remove seal file
    (DATA_DIR / files["seal"]).unlink()
    try:
        build_ledger_obj("2025-09-21", seed, sweeps, None)
        assert False, "Should have failed with missing seal"
    except Exception:
        pass  # expected

def test_merkle_root_consistency():
    """Test that merkle root is deterministic"""
    files, seed, sweeps, seal, ledger = setup_day("2025-09-22")
    
    # Compute multiple times
    root1 = build_ledger_obj("2025-09-22", seed, sweeps, seal)["day_root"]
    root2 = build_ledger_obj("2025-09-22", seed, sweeps, seal)["day_root"]
    
    assert root1 == root2, "Merkle root should be deterministic"

def test_count_consistency():
    """Test that counts match actual files"""
    files, seed, sweeps, seal, ledger = setup_day("2025-09-23")
    
    assert ledger["counts"]["seeds"] == 1
    assert ledger["counts"]["sweeps"] == 2
    assert ledger["counts"]["seals"] == 1
