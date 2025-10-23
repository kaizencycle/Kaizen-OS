#!/usr/bin/env python3
"""
Integrity Check Script for CI/CD Pipeline

Validates content against GIC Reward Engine thresholds to prevent
AI slop and drift from entering the codebase.

Usage:
    python scripts/integrity_check.py [options]

Options:
    --min-truth FLOAT        Minimum truth score (default: 0.7)
    --min-symbiosis FLOAT   Minimum symbiosis score (default: 0.6)
    --max-entropy FLOAT     Maximum entropy penalty (default: 0.4)
    --min-novelty FLOAT     Minimum novelty score (default: 0.15)
    --drift-threshold FLOAT Drift anomaly threshold (default: 0.35)
    --manifest PATH         Path to reward manifest (default: core/rewards/manifest.json)
    --verbose               Enable verbose output
    --dry-run               Show what would be checked without failing
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import re

# Add core directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "core"))

from rewards.integrity_engine import evaluate_reward, load_manifest


def find_content_files(repo_root: Path) -> List[Path]:
    """Find files that should be checked for integrity."""
    content_patterns = [
        "**/*.md",
        "**/*.ipynb", 
        "src/**/*.py",
        "src/**/*.ts",
        "src/**/*.tsx",
        "src/**/*.js",
        "src/**/*.jsx",
        "docs/**/*.md",
        "docs/**/*.rst",
        "core/**/*.py",
        "app/**/*.py",
        "services/**/*.py"
    ]
    
    files = []
    for pattern in content_patterns:
        files.extend(repo_root.glob(pattern))
    
    # Filter out common non-content files
    exclude_patterns = [
        "**/node_modules/**",
        "**/__pycache__/**",
        "**/.git/**",
        "**/venv/**",
        "**/env/**",
        "**/test_*.py",
        "**/*_test.py",
        "**/conftest.py"
    ]
    
    filtered_files = []
    for file_path in files:
        should_exclude = False
        for exclude in exclude_patterns:
            if file_path.match(exclude):
                should_exclude = True
                break
        if not should_exclude and file_path.is_file():
            filtered_files.append(file_path)
    
    return filtered_files


def extract_content_from_file(file_path: Path) -> Dict[str, str]:
    """Extract human and agent content from a file."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {"error": f"Could not read file: {e}"}
    
    # For markdown files, look for specific patterns
    if file_path.suffix == '.md':
        return extract_markdown_content(content)
    
    # For Python files, look for docstrings and comments
    elif file_path.suffix == '.py':
        return extract_python_content(content)
    
    # For TypeScript/JavaScript files
    elif file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
        return extract_js_content(content)
    
    # For Jupyter notebooks
    elif file_path.suffix == '.ipynb':
        return extract_notebook_content(content)
    
    # Default: treat as plain text
    else:
        return {"human_statement": content[:1000], "agent_statement": ""}


def extract_markdown_content(content: str) -> Dict[str, str]:
    """Extract human and agent statements from markdown."""
    # Look for specific markdown patterns
    human_patterns = [
        r'## Human[:\s]*(.*?)(?=##|\Z)',
        r'### Human[:\s]*(.*?)(?=###|\Z)',
        r'<!-- Human: (.*?) -->',
        r'\[Human\]:\s*(.*?)(?=\n\n|\Z)'
    ]
    
    agent_patterns = [
        r'## Agent[:\s]*(.*?)(?=##|\Z)',
        r'### Agent[:\s]*(.*?)(?=###|\Z)',
        r'<!-- Agent: (.*?) -->',
        r'\[Agent\]:\s*(.*?)(?=\n\n|\Z)'
    ]
    
    human_statement = ""
    agent_statement = ""
    
    for pattern in human_patterns:
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            human_statement = match.group(1).strip()
            break
    
    for pattern in agent_patterns:
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            agent_statement = match.group(1).strip()
            break
    
    # If no specific patterns found, use first paragraph as human, second as agent
    if not human_statement and not agent_statement:
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        if len(paragraphs) >= 1:
            human_statement = paragraphs[0][:500]
        if len(paragraphs) >= 2:
            agent_statement = paragraphs[1][:500]
    
    return {
        "human_statement": human_statement,
        "agent_statement": agent_statement
    }


def extract_python_content(content: str) -> Dict[str, str]:
    """Extract content from Python files."""
    # Look for docstrings and comments
    docstring_pattern = r'"""(.*?)"""'
    comment_pattern = r'# (.*?)(?=\n|$)'
    
    docstrings = re.findall(docstring_pattern, content, re.DOTALL)
    comments = re.findall(comment_pattern, content, re.MULTILINE)
    
    human_statement = ""
    agent_statement = ""
    
    if docstrings:
        human_statement = docstrings[0].strip()[:500]
    if len(docstrings) > 1:
        agent_statement = docstrings[1].strip()[:500]
    elif comments:
        agent_statement = " ".join(comments[:5])[:500]
    
    return {
        "human_statement": human_statement,
        "agent_statement": agent_statement
    }


def extract_js_content(content: str) -> Dict[str, str]:
    """Extract content from JavaScript/TypeScript files."""
    # Look for JSDoc comments and regular comments
    jsdoc_pattern = r'/\*\*(.*?)\*/'
    comment_pattern = r'// (.*?)(?=\n|$)'
    
    jsdocs = re.findall(jsdoc_pattern, content, re.DOTALL)
    comments = re.findall(comment_pattern, content, re.MULTILINE)
    
    human_statement = ""
    agent_statement = ""
    
    if jsdocs:
        human_statement = jsdocs[0].strip()[:500]
    if len(jsdocs) > 1:
        agent_statement = jsdocs[1].strip()[:500]
    elif comments:
        agent_statement = " ".join(comments[:5])[:500]
    
    return {
        "human_statement": human_statement,
        "agent_statement": agent_statement
    }


def extract_notebook_content(content: str) -> Dict[str, str]:
    """Extract content from Jupyter notebooks."""
    try:
        notebook = json.loads(content)
        cells = notebook.get("cells", [])
        
        human_statement = ""
        agent_statement = ""
        
        for cell in cells:
            if cell.get("cell_type") == "markdown":
                cell_content = "".join(cell.get("source", []))
                if not human_statement:
                    human_statement = cell_content[:500]
                elif not agent_statement:
                    agent_statement = cell_content[:500]
                    break
        
        return {
            "human_statement": human_statement,
            "agent_statement": agent_statement
        }
    except Exception:
        return {"human_statement": content[:1000], "agent_statement": ""}


def create_payload_from_file(file_path: Path, content_data: Dict[str, str]) -> Dict[str, Any]:
    """Create a reward evaluation payload from file content."""
    if "error" in content_data:
        return None
    
    # Generate synthetic evidence based on file
    evidence = {
        "citations": [],
        "observations": [],
        "artifacts": []
    }
    
    # Add file path as artifact
    evidence["artifacts"].append(str(file_path))
    
    # Look for URLs in content (potential citations)
    content = content_data.get("human_statement", "") + " " + content_data.get("agent_statement", "")
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(url_pattern, content)
    evidence["citations"] = urls[:5]  # Limit to 5 URLs
    
    # Determine task type based on file path
    task_type = "reflection"
    if "test" in str(file_path).lower():
        task_type = "fix"
    elif "docs" in str(file_path).lower():
        task_type = "lesson"
    elif "data" in str(file_path).lower():
        task_type = "dataset"
    elif "deploy" in str(file_path).lower() or "infra" in str(file_path).lower():
        task_type = "deployment"
    
    payload = {
        "human_statement": content_data.get("human_statement", ""),
        "agent_statement": content_data.get("agent_statement", ""),
        "evidence": evidence,
        "task_type": task_type,
        "nonce": f"ci-check-{file_path.name}-{hash(str(file_path))}",
        "timestamp": "2024-01-01T00:00:00Z",  # CI timestamp
        "scores": {},  # Will be calculated
        "penalties": {}  # Will be calculated
    }
    
    return payload


def check_file_integrity(file_path: Path, manifest: Dict[str, Any], 
                        thresholds: Dict[str, float], verbose: bool = False) -> Dict[str, Any]:
    """Check a single file against integrity thresholds."""
    if verbose:
        print(f"Checking {file_path}...")
    
    # Extract content
    content_data = extract_content_from_file(file_path)
    if "error" in content_data:
        return {
            "file": str(file_path),
            "error": content_data["error"],
            "passed": False
        }
    
    # Skip files with no meaningful content
    if not content_data.get("human_statement") and not content_data.get("agent_statement"):
        return {
            "file": str(file_path),
            "skipped": True,
            "reason": "No meaningful content found",
            "passed": True
        }
    
    # Create payload
    payload = create_payload_from_file(file_path, content_data)
    if not payload:
        return {
            "file": str(file_path),
            "error": "Could not create payload",
            "passed": False
        }
    
    # Evaluate reward
    try:
        result = evaluate_reward(payload, manifest)
    except Exception as e:
        return {
            "file": str(file_path),
            "error": f"Evaluation failed: {e}",
            "passed": False
        }
    
    # Check thresholds
    scores = result.get("scores", {})
    penalties = result.get("penalties", {})
    
    checks = {
        "truth": scores.get("truth", 0) >= thresholds["min_truth"],
        "symbiosis": scores.get("symbiosis", 0) >= thresholds["min_symbiosis"],
        "entropy": penalties.get("entropy", 1) <= thresholds["max_entropy"],
        "novelty": scores.get("novelty", 0) >= thresholds["min_novelty"],
        "drift": penalties.get("drift_anomaly", 1) <= thresholds["drift_threshold"]
    }
    
    passed = all(checks.values())
    
    return {
        "file": str(file_path),
        "passed": passed,
        "scores": scores,
        "penalties": penalties,
        "checks": checks,
        "gic": result.get("GIC", 0),
        "integrity": result.get("integrity", 0)
    }


def main():
    parser = argparse.ArgumentParser(description="Integrity Check for CI/CD Pipeline")
    parser.add_argument("--min-truth", type=float, default=0.7,
                       help="Minimum truth score (default: 0.7)")
    parser.add_argument("--min-symbiosis", type=float, default=0.6,
                       help="Minimum symbiosis score (default: 0.6)")
    parser.add_argument("--max-entropy", type=float, default=0.4,
                       help="Maximum entropy penalty (default: 0.4)")
    parser.add_argument("--min-novelty", type=float, default=0.15,
                       help="Minimum novelty score (default: 0.15)")
    parser.add_argument("--drift-threshold", type=float, default=0.35,
                       help="Drift anomaly threshold (default: 0.35)")
    parser.add_argument("--manifest", type=str, default="core/rewards/manifest.json",
                       help="Path to reward manifest")
    parser.add_argument("--verbose", action="store_true",
                       help="Enable verbose output")
    parser.add_argument("--dry-run", action="store_true",
                       help="Show what would be checked without failing")
    parser.add_argument("--files", nargs="*",
                       help="Specific files to check (default: auto-detect)")
    
    args = parser.parse_args()
    
    # Load manifest
    try:
        manifest = load_manifest(args.manifest)
    except Exception as e:
        print(f"Error loading manifest: {e}")
        sys.exit(1)
    
    # Set up thresholds
    thresholds = {
        "min_truth": args.min_truth,
        "min_symbiosis": args.min_symbiosis,
        "max_entropy": args.max_entropy,
        "min_novelty": args.min_novelty,
        "drift_threshold": args.drift_threshold
    }
    
    # Find files to check
    if args.files:
        files_to_check = [Path(f) for f in args.files if Path(f).exists()]
    else:
        repo_root = Path(__file__).parent.parent
        files_to_check = find_content_files(repo_root)
    
    if not files_to_check:
        print("No files found to check")
        sys.exit(0)
    
    if args.verbose:
        print(f"Found {len(files_to_check)} files to check")
        print(f"Thresholds: {thresholds}")
    
    # Check files
    results = []
    failed_files = []
    
    for file_path in files_to_check:
        result = check_file_integrity(file_path, manifest, thresholds, args.verbose)
        results.append(result)
        
        if not result.get("passed", False) and not result.get("skipped", False):
            failed_files.append(result)
    
    # Report results
    total_files = len(results)
    passed_files = sum(1 for r in results if r.get("passed", False))
    skipped_files = sum(1 for r in results if r.get("skipped", False))
    failed_files_count = len(failed_files)
    
    print(f"\nIntegrity Check Results:")
    print(f"  Total files: {total_files}")
    print(f"  Passed: {passed_files}")
    print(f"  Skipped: {skipped_files}")
    print(f"  Failed: {failed_files_count}")
    
    if failed_files:
        print(f"\nFailed files:")
        for result in failed_files:
            print(f"  {result['file']}")
            if "error" in result:
                print(f"    Error: {result['error']}")
            else:
                checks = result.get("checks", {})
                failed_checks = [k for k, v in checks.items() if not v]
                print(f"    Failed checks: {', '.join(failed_checks)}")
                scores = result.get("scores", {})
                penalties = result.get("penalties", {})
                print(f"    Scores: truth={scores.get('truth', 0):.3f}, "
                      f"symbiosis={scores.get('symbiosis', 0):.3f}, "
                      f"novelty={scores.get('novelty', 0):.3f}")
                print(f"    Penalties: entropy={penalties.get('entropy', 0):.3f}, "
                      f"drift={penalties.get('drift_anomaly', 0):.3f}")
    
    # Exit with error code if any files failed
    if failed_files and not args.dry_run:
        sys.exit(1)
    elif args.dry_run:
        print("\nDry run completed - no files were actually failed")
    
    print("\nIntegrity check passed!")


if __name__ == "__main__":
    main()