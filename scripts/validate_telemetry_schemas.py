#!/usr/bin/env python3
"""
Telemetry Schema Validation Script

Validates that telemetry schema files are valid JSON Schema and 
can be used for runtime validation of metrics.

Usage:
    python scripts/validate_telemetry_schemas.py

Exit codes:
    0 - All schemas valid
    1 - Validation errors found
"""

import json
import sys
from pathlib import Path
from typing import List, Tuple


def validate_json_schema(schema_path: Path) -> Tuple[bool, str]:
    """
    Validate that a file is valid JSON and contains valid JSON Schema.
    
    Args:
        schema_path: Path to schema file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        with open(schema_path, 'r') as f:
            schema = json.load(f)
        
        # Check for required JSON Schema fields
        if '$schema' not in schema:
            return False, "Missing required '$schema' field"
        
        if 'title' not in schema:
            return False, "Missing required 'title' field"
        
        if 'type' not in schema:
            return False, "Missing required 'type' field"
        
        # Validate $schema is a valid JSON Schema URL
        valid_schemas = [
            'http://json-schema.org/draft-04/schema#',
            'http://json-schema.org/draft-06/schema#',
            'http://json-schema.org/draft-07/schema#',
            'https://json-schema.org/draft/2019-09/schema',
            'https://json-schema.org/draft/2020-12/schema'
        ]
        
        if schema['$schema'] not in valid_schemas:
            return False, f"Unknown $schema version: {schema['$schema']}"
        
        return True, ""
        
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {str(e)}"
    except Exception as e:
        return False, f"Error reading file: {str(e)}"


def find_schema_files(base_path: Path) -> List[Path]:
    """
    Find all JSON schema files in the telemetry schemas directory.
    
    Args:
        base_path: Base path to search
        
    Returns:
        List of schema file paths
    """
    schema_dir = base_path / "config" / "telemetry" / "schemas"
    
    if not schema_dir.exists():
        print(f"⚠️  Warning: Telemetry schemas directory not found: {schema_dir}")
        return []
    
    return list(schema_dir.glob("*.json"))


def main():
    """Main validation function."""
    print("🔍 Kaizen OS Telemetry Schema Validator\n")
    
    # Get repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    # Find all schema files
    schema_files = find_schema_files(repo_root)
    
    if not schema_files:
        print("❌ No schema files found to validate")
        return 1
    
    print(f"📄 Found {len(schema_files)} schema file(s) to validate\n")
    
    # Validate each schema
    errors = []
    for schema_path in schema_files:
        print(f"Validating: {schema_path.name}...", end=" ")
        
        is_valid, error_msg = validate_json_schema(schema_path)
        
        if is_valid:
            print("✅")
        else:
            print(f"❌\n   Error: {error_msg}")
            errors.append((schema_path.name, error_msg))
    
    # Print summary
    print("\n" + "=" * 60)
    if errors:
        print(f"❌ Validation Failed: {len(errors)} error(s) found\n")
        for filename, error in errors:
            print(f"   {filename}: {error}")
        return 1
    else:
        print(f"✅ All {len(schema_files)} schema(s) valid!")
        print("\n📊 Schema Details:")
        for schema_path in schema_files:
            with open(schema_path) as f:
                schema = json.load(f)
                print(f"   • {schema.get('title', 'Unknown')} (v{schema.get('version', '?')})")
        return 0


if __name__ == "__main__":
    sys.exit(main())
