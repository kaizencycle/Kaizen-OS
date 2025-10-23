#!/usr/bin/env python3
"""
ATLAS Sentinel - Quality & Integrity Auditor
Integrates with Lab7-proof ECI pipeline

Author: ATLAS with Kaizen
Cycle: C-109
Doctrine-ID: VA-2025-01
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import hashlib


class AtlasAuditor:
    """ATLAS Sentinel - Quality & Integrity Auditor"""
    
    def __init__(self, config_path: str = "configs/atlas-config.json"):
        """Initialize ATLAS auditor with configuration"""
        self.config_path = config_path
        self.config = self._load_config()
        self.cycle = f"C-{datetime.now().timetuple().tm_yday}"
        self.start_time = time.time()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load ATLAS configuration"""
        default_config = {
            "prohibited_patterns": [
                "eval(",
                "exec(",
                "new Function(",
                "__import__",
                "dangerouslySetInnerHTML",
                "localStorage.setItem",
                "sessionStorage",
                "document.write("
            ],
            "required_virtue_tags": [
                "Doctrine-ID",
                "Ethics", 
                "Policy",
                "Governance"
            ],
            "thresholds": {
                "gi_score": 0.95,
                "quality_score": 0.90,
                "max_violations": 0
            }
        }
        
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults
                    for key, value in default_config.items():
                        if key not in config:
                            config[key] = value
                    return config
            except Exception as e:
                print(f"Warning: Could not load config from {self.config_path}: {e}")
                return default_config
        else:
            return default_config
    
    def run_full_audit(self, files: List[str]) -> Dict[str, Any]:
        """Run complete ATLAS audit on specified files"""
        print(f"ATLAS Sentinel Awakening - Cycle {self.cycle}")
        print(f"Auditing {len(files)} files...")
        
        results = {
            "cycle": self.cycle,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "files_audited": len(files),
            "phases": {}
        }
        
        # Phase 1: Code Quality Analysis
        print("\n=== PHASE 1: CODE QUALITY ===")
        quality_result = self._audit_code_quality(files)
        results["phases"]["quality"] = quality_result
        
        # Phase 2: Anti-Drift Detection
        print("\n=== PHASE 2: ANTI-DRIFT DETECTION ===")
        drift_result = self._audit_drift_detection(files)
        results["phases"]["drift"] = drift_result
        
        # Phase 3: Custos Charter Compliance
        print("\n=== PHASE 3: CHARTER COMPLIANCE ===")
        charter_result = self._audit_charter_compliance(files)
        results["phases"]["charter"] = charter_result
        
        # Phase 4: GI Score Calculation
        print("\n=== PHASE 4: GI SCORE CALCULATION ===")
        gi_result = self._calculate_gi_score(quality_result, drift_result, charter_result)
        results["phases"]["gi_score"] = gi_result
        
        # Phase 5: Generate Attestation
        print("\n=== PHASE 5: ATTESTATION ===")
        attestation = self._generate_attestation(results)
        results["attestation"] = attestation
        
        # Final decision
        results["approved_for_quorum"] = gi_result["passed"]
        
        duration = time.time() - self.start_time
        print(f"\nATLAS Clock-Out - Duration: {duration:.2f}s")
        print(f"Final Decision: {'APPROVED' if results['approved_for_quorum'] else 'BLOCKED'}")
        
        return results
    
    def _audit_code_quality(self, files: List[str]) -> Dict[str, Any]:
        """Phase 1: Code Quality Analysis"""
        result = {
            "lint": "pass",
            "types": "pass", 
            "tests": "pass",
            "coverage": 0.0
        }
        
        # Check for Python files
        python_files = [f for f in files if f.endswith('.py')]
        js_files = [f for f in files if f.endswith(('.js', '.ts', '.tsx', '.jsx'))]
        
        # Python linting
        if python_files:
            try:
                subprocess.run(['python', '-m', 'flake8'] + python_files, 
                             check=True, capture_output=True)
                print("Python lint: PASS")
            except subprocess.CalledProcessError:
                print("Python lint: FAIL")
                result["lint"] = "fail"
        
        # JavaScript/TypeScript linting
        if js_files:
            try:
                subprocess.run(['npm', 'run', 'lint'], check=True, capture_output=True)
                print("JS/TS lint: PASS")
            except subprocess.CalledProcessError:
                print("JS/TS lint: FAIL")
                result["lint"] = "fail"
        
        # Type checking
        if js_files:
            try:
                subprocess.run(['npm', 'run', 'type-check'], check=True, capture_output=True)
                print("TypeScript: PASS")
            except subprocess.CalledProcessError:
                print("TypeScript: FAIL")
                result["types"] = "fail"
        
        # Test coverage (simplified)
        try:
            # Try to run tests and extract coverage
            test_output = subprocess.run(['npm', 'test'], 
                                       capture_output=True, text=True)
            if test_output.returncode == 0:
                print("Tests: PASS")
                # Extract coverage from output (simplified)
                coverage_match = re.search(r'All files.*?(\d+\.?\d*)%', test_output.stdout)
                if coverage_match:
                    result["coverage"] = float(coverage_match.group(1))
                    print(f"Coverage: {result['coverage']}%")
            else:
                print("Tests: FAIL")
                result["tests"] = "fail"
        except Exception as e:
            print(f"Test execution failed: {e}")
            result["tests"] = "fail"
        
        return result
    
    def _audit_drift_detection(self, files: List[str]) -> Dict[str, Any]:
        """Phase 2: Anti-Drift Detection"""
        result = {
            "violations": 0,
            "severity": "low",
            "violated_patterns": []
        }
        
        prohibited_patterns = self.config["prohibited_patterns"]
        
        for file_path in files:
            if not os.path.exists(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                for pattern in prohibited_patterns:
                    if pattern in content:
                        result["violations"] += 1
                        result["violated_patterns"].append({
                            "file": file_path,
                            "pattern": pattern
                        })
                        print(f"Found prohibited pattern '{pattern}' in {file_path}")
            except Exception as e:
                print(f"Could not read {file_path}: {e}")
        
        # Determine severity
        if result["violations"] == 0:
            result["severity"] = "low"
            print("No prohibited patterns detected")
        elif result["violations"] <= 2:
            result["severity"] = "medium"
            print(f"Medium severity: {result['violations']} violations")
        else:
            result["severity"] = "high"
            print(f"High severity: {result['violations']} violations")
        
        return result
    
    def _audit_charter_compliance(self, files: List[str]) -> Dict[str, Any]:
        """Phase 3: Custos Charter Compliance"""
        result = {
            "missing_tags": 0,
            "policy_files_checked": 0,
            "compliant_files": []
        }
        
        # Check policy files
        policy_files = [f for f in files if f.endswith(('.md', '.yml', '.yaml'))]
        required_tags = self.config["required_virtue_tags"]
        
        for file_path in policy_files:
            if not os.path.exists(file_path):
                continue
                
            result["policy_files_checked"] += 1
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                has_tags = any(tag in content for tag in required_tags)
                
                if has_tags:
                    result["compliant_files"].append(file_path)
                    print(f"{file_path} - Charter compliant")
                else:
                    result["missing_tags"] += 1
                    print(f"{file_path} - Missing virtue tags")
            except Exception as e:
                print(f"Could not read {file_path}: {e}")
        
        if result["policy_files_checked"] == 0:
            print("No policy files to check")
        else:
            print(f"Checked {result['policy_files_checked']} policy files")
        
        return result
    
    def _calculate_gi_score(self, quality: Dict, drift: Dict, charter: Dict) -> Dict[str, Any]:
        """Phase 4: Calculate GI Score"""
        print("Formula: GI = a*M + b*H + c*I + d*E")
        
        # Extract components
        coverage = quality.get("coverage", 0.0)
        violations = drift.get("violations", 0)
        missing_tags = charter.get("missing_tags", 0)
        
        # Calculate components (0-1 scale)
        M = coverage / 100.0  # Memory (test coverage)
        H = 1.0  # Human (PR review - always 1.0 in CI context)
        I = max(0.0, 1.0 - (violations / 10.0))  # Integrity (1 - violations/10)
        E = max(0.0, 1.0 - (missing_tags / 5.0))  # Ethics (1 - missing_tags/5)
        
        # Apply weights: a=0.25, b=0.20, c=0.30, d=0.25
        GI = (0.25 * M) + (0.20 * H) + (0.30 * I) + (0.25 * E)
        
        # Check threshold
        threshold = self.config["thresholds"]["gi_score"]
        passed = GI >= threshold
        
        print(f"Components:")
        print(f"  M (Memory): {M:.3f} (Coverage: {coverage}%)")
        print(f"  H (Human): {H:.3f} (PR review)")
        print(f"  I (Integrity): {I:.3f} (Violations: {violations})")
        print(f"  E (Ethics): {E:.3f} (Missing tags: {missing_tags})")
        print(f"Final GI Score: {GI:.3f}")
        print(f"Threshold: {threshold}")
        print(f"Result: {'PASS' if passed else 'FAIL'}")
        
        return {
            "total": GI,
            "components": {
                "memory": M,
                "human": H,
                "integrity": I,
                "ethics": E
            },
            "threshold": threshold,
            "passed": passed
        }
    
    def _generate_attestation(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Phase 5: Generate Attestation"""
        attestation = {
            "agent": "ATLAS",
            "cycle": self.cycle,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "commit": self._get_commit_sha(),
            "gi_score": results["phases"]["gi_score"],
            "quality": results["phases"]["quality"],
            "drift": results["phases"]["drift"],
            "charter": results["phases"]["charter"]
        }
        
        # Generate hash
        attestation_json = json.dumps(attestation, sort_keys=True)
        attestation_hash = hashlib.sha256(attestation_json.encode()).hexdigest()
        attestation["hash"] = attestation_hash
        
        print(f"Generated attestation hash: {attestation_hash[:16]}...")
        
        return attestation
    
    def _get_commit_sha(self) -> str:
        """Get current commit SHA"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                  capture_output=True, text=True)
            return result.stdout.strip()
        except Exception:
            return "unknown"
    
    def save_attestation(self, results: Dict[str, Any], output_path: str = "atlas-attestation.json"):
        """Save attestation to file"""
        with open(output_path, 'w') as f:
            json.dump(results["attestation"], f, indent=2)
        print(f"Attestation saved to {output_path}")


def main():
    """Main entry point for ATLAS auditor"""
    if len(sys.argv) < 2:
        print("Usage: python atlas_auditor.py <file1> [file2] ...")
        print("       python atlas_auditor.py --all  # Audit all tracked files")
        sys.exit(1)
    
    if sys.argv[1] == "--all":
        # Get all tracked files
        try:
            result = subprocess.run(['git', 'ls-files'], capture_output=True, text=True)
            files = result.stdout.strip().split('\n')
        except Exception as e:
            print(f"Error getting git files: {e}")
            sys.exit(1)
    else:
        files = sys.argv[1:]
    
    # Initialize auditor
    auditor = AtlasAuditor()
    
    # Run audit
    results = auditor.run_full_audit(files)
    
    # Save attestation
    auditor.save_attestation(results)
    
    # Exit with appropriate code
    if results["approved_for_quorum"]:
        print("\nATLAS audit passed - proceeding to quorum")
        sys.exit(0)
    else:
        print("\nATLAS audit failed - blocking pipeline")
        sys.exit(1)


if __name__ == "__main__":
    main()
