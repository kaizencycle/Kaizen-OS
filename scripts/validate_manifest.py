#!/usr/bin/env python3
"""
Kaizen OS Manifest Validation Script
Validates kaizen_manifest.yaml against the JSON schema
"""
import json
import yaml
import sys
from pathlib import Path
from jsonschema import validate, ValidationError

def main():
    try:
        # Load the manifest
        manifest_path = Path("kaizen_manifest.yaml")
        if not manifest_path.exists():
            print("❌ kaizen_manifest.yaml not found")
            sys.exit(1)
            
        with open(manifest_path) as f:
            data = yaml.safe_load(f)
        
        # Load the schema
        schema_path = Path("schemas/kaizen_manifest.schema.json")
        if not schema_path.exists():
            print("⚠️  Schema file not found, skipping validation")
            print("✅ kaizen_manifest.yaml loaded successfully")
            return
            
        with open(schema_path) as f:
            schema = json.load(f)
        
        # Validate
        validate(instance=data, schema=schema)
        print("✅ kaizen_manifest.yaml is valid")
        
        # Additional checks
        print(f"📋 System: {data['meta']['system_name']} v{data['meta']['version']}")
        print(f"👤 Owner: {data['meta']['owner']}")
        print(f"🏛️  Anchors: {len(data['anchors'])}")
        print(f"🤖 Agents: {len(data['agents']['default'])}")
        print(f"🔬 Labs: {len(data['labs'])}")
        print(f"📜 Accords: {len(data['virtue_accords']['accords'])}")
        
    except yaml.YAMLError as e:
        print(f"❌ YAML parsing error: {e}")
        sys.exit(1)
    except ValidationError as e:
        print(f"❌ Schema validation error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()