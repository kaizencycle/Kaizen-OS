#!/usr/bin/env python3
"""
Civic Ledger Hook System
Handles automatic synchronization of chamber sweeps to Command Ledger
"""

import json
import hashlib
import os
import requests
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

class LedgerHook:
    def __init__(self, ledger_endpoint: str = None):
        self.ledger_endpoint = ledger_endpoint or os.getenv('CIVIC_LEDGER_ENDPOINT')
        self.sweeps_dir = Path('.civic/sweeps')
        self.sweeps_dir.mkdir(exist_ok=True)
    
    def generate_integrity_anchor(self, content: str) -> str:
        """Generate SHA256 integrity anchor for content"""
        return f"sha256:{hashlib.sha256(content.encode()).hexdigest()}"
    
    def create_chamber_sweep(self, chamber_id: str, parent_chamber: str, 
                           cycle: str, summary: str, artifacts: List[str] = None,
                           morale_delta: float = 0.0) -> Dict:
        """Create a chamber sweep record"""
        timestamp = datetime.utcnow().isoformat() + 'Z'
        content = f"{chamber_id}:{parent_chamber}:{cycle}:{summary}:{timestamp}"
        integrity_anchor = self.generate_integrity_anchor(content)
        
        sweep = {
            "chamber_id": chamber_id,
            "parent_chamber": parent_chamber,
            "cycle": cycle,
            "summary": summary,
            "artifacts": artifacts or [],
            "morale_delta": morale_delta,
            "timestamp": timestamp,
            "integrity_anchor": integrity_anchor,
            "result_status": "Complete"
        }
        
        return sweep
    
    def save_sweep(self, sweep: Dict) -> str:
        """Save sweep to local file system"""
        cycle_dir = self.sweeps_dir / sweep['cycle']
        cycle_dir.mkdir(exist_ok=True)
        
        filename = f"{sweep['chamber_id'].lower().replace(' ', '-')}-sweep.json"
        filepath = cycle_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(sweep, f, indent=2)
        
        return str(filepath)
    
    def sync_to_ledger(self, sweep: Dict) -> bool:
        """Sync sweep to Command Ledger endpoint"""
        if not self.ledger_endpoint:
            print("⚠️ No ledger endpoint configured, saving locally only")
            return False
        
        try:
            response = requests.post(
                f"{self.ledger_endpoint}/api/ledger/sync",
                json=sweep,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            response.raise_for_status()
            print(f"✅ Sweep synced to ledger: {sweep['integrity_anchor']}")
            return True
        except Exception as e:
            print(f"❌ Failed to sync to ledger: {e}")
            return False
    
    def collect_sweeps(self, cycle: str) -> List[Dict]:
        """Collect all sweeps for a given cycle"""
        cycle_dir = self.sweeps_dir / cycle
        if not cycle_dir.exists():
            return []
        
        sweeps = []
        for filepath in cycle_dir.glob('*-sweep.json'):
            with open(filepath) as f:
                sweeps.append(json.load(f))
        
        return sweeps
    
    def generate_cycle_summary(self, cycle: str) -> Dict:
        """Generate summary for an entire cycle"""
        sweeps = self.collect_sweeps(cycle)
        
        if not sweeps:
            return {"error": f"No sweeps found for cycle {cycle}"}
        
        total_morale_delta = sum(sweep.get('morale_delta', 0) for sweep in sweeps)
        chamber_count = len(sweeps)
        
        summary = {
            "cycle": cycle,
            "chamber_count": chamber_count,
            "total_morale_delta": total_morale_delta,
            "sweeps": sweeps,
            "generated_at": datetime.utcnow().isoformat() + 'Z'
        }
        
        return summary

def main():
    """CLI interface for Ledger Hook"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Civic Ledger Hook System')
    parser.add_argument('--chamber', required=True, help='Chamber ID')
    parser.add_argument('--parent', required=True, help='Parent chamber')
    parser.add_argument('--cycle', required=True, help='Cycle ID')
    parser.add_argument('--summary', required=True, help='Summary text')
    parser.add_argument('--artifacts', nargs='*', help='Artifact file paths')
    parser.add_argument('--morale', type=float, default=0.0, help='Morale delta')
    parser.add_argument('--sync', action='store_true', help='Sync to ledger')
    
    args = parser.parse_args()
    
    hook = LedgerHook()
    
    # Create sweep
    sweep = hook.create_chamber_sweep(
        chamber_id=args.chamber,
        parent_chamber=args.parent,
        cycle=args.cycle,
        summary=args.summary,
        artifacts=args.artifacts,
        morale_delta=args.morale
    )
    
    # Save locally
    filepath = hook.save_sweep(sweep)
    print(f"💾 Sweep saved to: {filepath}")
    
    # Sync to ledger if requested
    if args.sync:
        hook.sync_to_ledger(sweep)
    
    # Print sweep block for manual copy
    print("\n🕊️ Chamber Sweep Block:")
    print(f"🕊️ Chamber Sweep — {args.cycle}")
    print(f"Parent: {args.parent}")
    print(f"Result: ✅ Complete")
    print(f"Integrity Anchor: SHA256:{sweep['integrity_anchor'].split(':')[1]}")
    print(f"Summary: {args.summary}")
    if args.artifacts:
        print(f"Artifacts: {', '.join(args.artifacts)}")
    print(f"Morale Delta: {args.morale:+.2f}")

if __name__ == '__main__':
    main()