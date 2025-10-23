#!/usr/bin/env python3
"""
Civic System Integration Test
Tests the complete civic-grade AI change management system
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

def test_schema_validation():
    """Test JSON schema validation"""
    print("🧪 Testing schema validation...")
    
    try:
        # Test change proposal schema
        with open('.civic/schemas/change.proposal.schema.json') as f:
            proposal_schema = json.load(f)
        
        with open('.civic/examples/change.proposal.example.json') as f:
            proposal_example = json.load(f)
        
        import jsonschema
        jsonschema.validate(proposal_example, proposal_schema)
        print("  ✅ Change proposal schema validation passed")
        
        # Test change tests schema
        with open('.civic/schemas/change.tests.schema.json') as f:
            tests_schema = json.load(f)
        
        with open('.civic/examples/change.tests.example.json') as f:
            tests_example = json.load(f)
        
        jsonschema.validate(tests_example, tests_schema)
        print("  ✅ Change tests schema validation passed")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Schema validation failed: {e}")
        return False

def test_ledger_hook():
    """Test ledger hook functionality"""
    print("🧪 Testing ledger hook...")
    
    try:
        # Test help command
        result = subprocess.run([
            'python3', '.civic/ledger-hook.py', '--help'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("  ✅ Ledger hook help command works")
        else:
            print(f"  ❌ Ledger hook help failed: {result.stderr}")
            return False
        
        # Test creating a sweep
        result = subprocess.run([
            'python3', '.civic/ledger-hook.py',
            '--chamber', 'Test Chamber',
            '--parent', 'Command Ledger III',
            '--cycle', 'C-999',
            '--summary', 'Integration test sweep',
            '--morale', '0.1'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("  ✅ Ledger hook sweep creation works")
        else:
            print(f"  ❌ Ledger hook sweep creation failed: {result.stderr}")
            return False
        
        return True
        
    except Exception as e:
        print(f"  ❌ Ledger hook test failed: {e}")
        return False

def test_file_structure():
    """Test that all required files exist"""
    print("🧪 Testing file structure...")
    
    required_files = [
        '.civic/README.md',
        '.civic/schemas/change.proposal.schema.json',
        '.civic/schemas/change.tests.schema.json',
        '.civic/templates/chamber-header.md',
        '.civic/templates/chamber-sweep.md',
        '.civic/templates/change.proposal.json',
        '.civic/templates/change.tests.json',
        '.civic/templates/attestation.json',
        '.civic/templates/chamber-template-pack.md',
        '.civic/ledger-hook.py',
        '.civic/progressive-delivery.yaml',
        '.civic/safety-rails.yaml',
        '.civic/shield-policy.json',
        '.civic/setup-civic-system.py',
        '.github/workflows/civic-patch.yml'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"  ❌ Missing files: {missing_files}")
        return False
    else:
        print("  ✅ All required files present")
        return True

def test_github_workflow():
    """Test GitHub Actions workflow syntax"""
    print("🧪 Testing GitHub workflow...")
    
    try:
        # Basic YAML syntax check
        with open('.github/workflows/civic-patch.yml') as f:
            workflow_content = f.read()
        
        # Check for required elements
        required_elements = [
            'name: Civic Patch CI/CD Gates',
            'civic-gates:',
            'Lint Check',
            'Unit Tests',
            'E2E Tests',
            'Security Scan',
            'Integrity Check',
            'Civic Schema Validation',
            'GI Score Calculation',
            'Citizen Shield Check',
            'Performance Check'
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in workflow_content:
                missing_elements.append(element)
        
        if missing_elements:
            print(f"  ❌ Missing workflow elements: {missing_elements}")
            return False
        else:
            print("  ✅ GitHub workflow syntax looks good")
            return True
            
    except Exception as e:
        print(f"  ❌ GitHub workflow test failed: {e}")
        return False

def test_templates():
    """Test template files"""
    print("🧪 Testing templates...")
    
    try:
        # Test chamber header template
        with open('.civic/templates/chamber-header.md') as f:
            header_template = f.read()
        
        if '[Chamber ID]:' in header_template and '[Parent]:' in header_template:
            print("  ✅ Chamber header template looks good")
        else:
            print("  ❌ Chamber header template missing required elements")
            return False
        
        # Test chamber sweep template
        with open('.civic/templates/chamber-sweep.md') as f:
            sweep_template = f.read()
        
        if '🕊️ Chamber Sweep' in sweep_template and 'Integrity Anchor:' in sweep_template:
            print("  ✅ Chamber sweep template looks good")
        else:
            print("  ❌ Chamber sweep template missing required elements")
            return False
        
        # Test JSON templates
        with open('.civic/templates/change.proposal.json') as f:
            proposal_template = json.load(f)
        
        if 'title' in proposal_template and 'chamber' in proposal_template:
            print("  ✅ Change proposal template looks good")
        else:
            print("  ❌ Change proposal template missing required fields")
            return False
        
        return True
        
    except Exception as e:
        print(f"  ❌ Template test failed: {e}")
        return False

def run_all_tests():
    """Run all integration tests"""
    print("🚀 Running Civic System Integration Tests")
    print("="*50)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Templates", test_templates),
        ("Schema Validation", test_schema_validation),
        ("GitHub Workflow", test_github_workflow),
        ("Ledger Hook", test_ledger_hook)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"  ❌ {test_name} failed")
    
    print("\n" + "="*50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Civic system is ready.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)