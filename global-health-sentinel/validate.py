# validate.py
import json, pathlib
from jsonschema import Draft202012Validator

def load_schema(schema_path: str):
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_payload(payload: dict, schema_path: str):
    schema = load_schema(schema_path)
    v = Draft202012Validator(schema)
    errors = sorted(v.iter_errors(payload), key=lambda e: e.path)
    return [f"{'/'.join(map(str,e.path))}: {e.message}" for e in errors]
