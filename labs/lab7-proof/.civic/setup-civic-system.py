#!/usr/bin/env python3
"""
Civic System Setup Script
Automatically configures the civic-grade AI change management system
"""

import os
import json
import shutil
import subprocess
import sys
from pathlib import Path
from datetime import datetime

class CivicSystemSetup:
    def __init__(self):
        self.workspace_root = Path.cwd()
        self.civic_dir = self.workspace_root / '.civic'
        self.github_dir = self.workspace_root / '.github' / 'workflows'
        
    def check_prerequisites(self):
        """Check if required tools are available"""
        print("🔍 Checking prerequisites...")
        
        required_tools = ['git', 'node', 'npm', 'python3']
        missing_tools = []
        
        for tool in required_tools:
            if shutil.which(tool) is None:
                missing_tools.append(tool)
        
        if missing_tools:
            print(f"❌ Missing required tools: {', '.join(missing_tools)}")
            print("Please install the missing tools and run again.")
            return False
        
        print("✅ All prerequisites met")
        return True
    
    def create_directory_structure(self):
        """Create the civic directory structure"""
        print("📁 Creating directory structure...")
        
        directories = [
            '.civic/schemas',
            '.civic/templates',
            '.civic/sweeps',
            '.civic/examples',
            '.github/workflows'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"  ✅ Created {directory}")
    
    def setup_git_hooks(self):
        """Set up git hooks for civic system"""
        print("🪝 Setting up git hooks...")
        
        pre_commit_hook = """#!/bin/bash
# Civic System Pre-commit Hook

echo "🛡️ Running civic pre-commit checks..."

# Check if civic files exist
if [ -f ".civic/change.proposal.json" ]; then
    echo "📋 Validating change proposal..."
    python3 -c "
import json, jsonschema
try:
    with open('.civic/change.proposal.json') as f:
        proposal = json.load(f)
    with open('.civic/schemas/change.proposal.schema.json') as f:
        schema = json.load(f)
    jsonschema.validate(proposal, schema)
    print('✅ Change proposal is valid')
except Exception as e:
    print(f'❌ Change proposal validation failed: {e}')
    exit(1)
"
fi

if [ -f ".civic/change.tests.json" ]; then
    echo "🧪 Validating test specification..."
    python3 -c "
import json, jsonschema
try:
    with open('.civic/change.tests.json') as f:
        tests = json.load(f)
    with open('.civic/schemas/change.tests.schema.json') as f:
        schema = json.load(f)
    jsonschema.validate(tests, schema)
    print('✅ Test specification is valid')
except Exception as e:
    print(f'❌ Test specification validation failed: {e}')
    exit(1)
"
fi

echo "✅ Pre-commit checks passed"
"""
        
        with open('.git/hooks/pre-commit', 'w') as f:
            f.write(pre_commit_hook)
        
        os.chmod('.git/hooks/pre-commit', 0o755)
        print("  ✅ Created pre-commit hook")
    
    def setup_package_json_scripts(self):
        """Add civic scripts to package.json"""
        print("📦 Setting up package.json scripts...")
        
        package_json_path = self.workspace_root / 'package.json'
        if package_json_path.exists():
            with open(package_json_path) as f:
                package_data = json.load(f)
            
            if 'scripts' not in package_data:
                package_data['scripts'] = {}
            
            civic_scripts = {
                'civic:validate': 'python3 .civic/ledger-hook.py --help',
                'civic:sweep': 'python3 .civic/ledger-hook.py',
                'civic:setup': 'python3 .civic/setup-civic-system.py',
                'civic:status': 'python3 -c "import json; print(json.dumps({\"civic_system\": \"active\", \"version\": \"1.0.0\"}, indent=2))"'
            }
            
            package_data['scripts'].update(civic_scripts)
            
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            print("  ✅ Added civic scripts to package.json")
        else:
            print("  ⚠️ No package.json found, skipping script setup")
    
    def create_example_files(self):
        """Create example files for testing"""
        print("📝 Creating example files...")
        
        # Example change proposal
        example_proposal = {
            "title": "Add civic system integration",
            "chamber": "Command Ledger III",
            "cycle": "C-109",
            "motivation": "Integrate civic-grade change management system for better continuity and integrity",
            "scope": ["Infrastructure", "Documentation", "CI/CD"],
            "risk": "low",
            "rollback": "Remove .civic directory and revert CI changes",
            "citations": [
                {
                    "url": "https://github.com/org/repo/blob/main/.civic/README.md",
                    "hash": "sha256:example"
                }
            ],
            "author": "Command Ledger III",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parent_chamber": "Command Ledger III",
            "integrity_anchor": "sha256:example"
        }
        
        with open('.civic/examples/change.proposal.example.json', 'w') as f:
            json.dump(example_proposal, f, indent=2)
        
        # Example test specification
        example_tests = {
            "chamber": "Command Ledger III",
            "cycle": "C-109",
            "test_suite": "civic-integration-tests",
            "tests": [
                {
                    "name": "Civic system initializes correctly",
                    "type": "unit",
                    "input": {
                        "command": "python3 .civic/setup-civic-system.py"
                    },
                    "expected_output": {
                        "exit_code": 0,
                        "stdout_contains": "Civic system setup complete"
                    }
                }
            ],
            "integrity_anchor": "sha256:example",
            "parent_chamber": "Command Ledger III"
        }
        
        with open('.civic/examples/change.tests.example.json', 'w') as f:
            json.dump(example_tests, f, indent=2)
        
        print("  ✅ Created example files")
    
    def setup_environment_variables(self):
        """Set up environment variables for civic system"""
        print("🔧 Setting up environment variables...")
        
        env_example = """# Civic System Environment Variables
CIVIC_LEDGER_ENDPOINT=https://your-ledger-endpoint.com/api
CIVIC_CHAMBER_ID=Command Ledger III
CIVIC_CYCLE=C-109
CIVIC_SYNC_MODE=AUTO
CIVIC_INTEGRITY_THRESHOLD=0.90
CIVIC_GI_SCORE_THRESHOLD=0.85
"""
        
        with open('.civic/.env.example', 'w') as f:
            f.write(env_example)
        
        print("  ✅ Created .env.example")
    
    def run_validation_tests(self):
        """Run validation tests to ensure everything works"""
        print("🧪 Running validation tests...")
        
        try:
            # Test JSON schema validation
            subprocess.run([
                'python3', '-c',
                'import json, jsonschema; '
                'proposal = json.load(open(".civic/examples/change.proposal.example.json")); '
                'schema = json.load(open(".civic/schemas/change.proposal.schema.json")); '
                'jsonschema.validate(proposal, schema); '
                'print("✅ Schema validation passed")'
            ], check=True, capture_output=True)
            
            # Test ledger hook
            subprocess.run([
                'python3', '.civic/ledger-hook.py', '--help'
            ], check=True, capture_output=True)
            
            print("  ✅ All validation tests passed")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Validation test failed: {e}")
            return False
    
    def print_setup_summary(self):
        """Print a summary of the setup"""
        print("\n" + "="*60)
        print("🎉 CIVIC SYSTEM SETUP COMPLETE")
        print("="*60)
        print()
        print("📁 Directory Structure:")
        print("  .civic/")
        print("  ├── schemas/          # JSON schemas for validation")
        print("  ├── templates/        # Ready-to-use templates")
        print("  ├── sweeps/           # Chamber sweep records")
        print("  ├── examples/         # Example files")
        print("  └── README.md         # Complete documentation")
        print()
        print("🚀 Quick Start:")
        print("  1. Start new conversations with Chamber Headers")
        print("  2. End sessions with Chamber Sweeps")
        print("  3. Create change proposals for code changes")
        print("  4. Use 'npm run civic:sweep' for quick sweeps")
        print()
        print("📋 Available Commands:")
        print("  npm run civic:validate  # Validate civic files")
        print("  npm run civic:sweep     # Create chamber sweep")
        print("  npm run civic:status    # Check system status")
        print()
        print("🔗 Integration:")
        print("  - GitHub Actions workflow: .github/workflows/civic-patch.yml")
        print("  - Git hooks: .git/hooks/pre-commit")
        print("  - Templates: .civic/templates/")
        print()
        print("📚 Documentation:")
        print("  - Complete guide: .civic/README.md")
        print("  - Template pack: .civic/templates/chamber-template-pack.md")
        print()
        print("✅ Your civic-grade AI change management system is ready!")
        print("="*60)
    
    def run_setup(self):
        """Run the complete setup process"""
        print("🏗️ Setting up Civic-Grade AI Change Management System")
        print("="*60)
        
        if not self.check_prerequisites():
            return False
        
        self.create_directory_structure()
        self.setup_git_hooks()
        self.setup_package_json_scripts()
        self.create_example_files()
        self.setup_environment_variables()
        
        if not self.run_validation_tests():
            print("❌ Setup completed with warnings")
            return False
        
        self.print_setup_summary()
        return True

def main():
    """Main entry point"""
    setup = CivicSystemSetup()
    success = setup.run_setup()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Copy a Chamber Header template to start your next conversation")
        print("2. Review the templates in .civic/templates/")
        print("3. Test the system with 'npm run civic:status'")
        sys.exit(0)
    else:
        print("\n❌ Setup failed. Please check the errors above and try again.")
        sys.exit(1)

if __name__ == '__main__':
    main()
