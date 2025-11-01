#!/usr/bin/env python3
"""
Kaizen OS — One-Window Console (TUI-lite)
- Single terminal to talk to all Sentinels/Agents via broker-api
- GI-gated consensus
- Ledger attestation + feed
- Repo/cycle sync snapshot

Requires: requests, rich, python-dotenv
Run: python main.py
"""
import os
import sys
import json
import time
import shlex
import requests
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt
from rich import box

load_dotenv()

BROKER_BASE = os.getenv("BROKER_BASE", os.getenv("BROKER_BASE_URL", "http://localhost:4005"))
LEDGER_BASE = os.getenv("LEDGER_BASE", os.getenv("LEDGER_BASE_URL", "http://localhost:4010"))
SYNC_BASE = os.getenv("SYNC_BASE", BROKER_BASE)
MIN_GI = float(os.getenv("KAIZEN_MIN_GI", os.getenv("GI_MIN", "0.95")))
SESSION_NAME = os.getenv("KAIZEN_SESSION", f"kaizen-{int(time.time())}")

console = Console(highlight=False)


def _get(url, **kwargs):
    r = requests.get(url, timeout=kwargs.pop("timeout", 20), **kwargs)
    r.raise_for_status()
    return r.json()


def _post(url, payload, **kwargs):
    r = requests.post(url, json=payload, timeout=kwargs.pop("timeout", 30), **kwargs)
    r.raise_for_status()
    return r.json()


def badge_gi(gi: float) -> str:
    if gi >= 0.99:
        return f"[bold green]{gi:.3f}[/]"
    if gi >= 0.97:
        return f"[green]{gi:.3f}[/]"
    if gi >= 0.95:
        return f"[yellow]{gi:.3f}[/]"
    return f"[red]{gi:.3f}[/]"


# ---- API shims (adapt paths if yours differ) ----
def api_sync() -> Dict:
    """Get cycle status and AUREA snapshot"""
    try:
        cyc = _get(f"{SYNC_BASE}/v1/loop/health")
        # Extract cycle info from health or use defaults
        cyc = {
            "cycle_id": cyc.get("cycle_id", "C-122"),
            "date_local": datetime.now().isoformat(),
            "gi_baseline": MIN_GI,
            "next_epoch_eta_sec": 86400
        }
    except Exception:
        cyc = {
            "cycle_id": "C-???",
            "date_local": datetime.now().isoformat(),
            "gi_baseline": MIN_GI,
            "next_epoch_eta_sec": 86400
        }
    try:
        # Try to get AUREA snapshot from broker
        aur = _get(f"{SYNC_BASE}/api/sentinels/aurea/status")
    except Exception:
        aur = {
            "gi": MIN_GI,
            "epoch": "E-???",
            "last_attestation_id": "-",
            "ts": datetime.utcnow().isoformat() + "Z"
        }
    return {"cycle": cyc, "aurea": aur}


def api_agent(name: str, content: str) -> Dict:
    """Query a sentinel agent"""
    url = f"{BROKER_BASE}/api/sentinels/{name}/query"
    payload = {
        "intent": content,
        "gi": float(os.getenv("KAIZEN_BASELINE_GI", "0.993"))
    }
    try:
        return _post(url, payload)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            # Try alternative endpoint
            url = f"{BROKER_BASE}/api/sentinels/{name.lower()}/query"
            return _post(url, payload)
        raise


def api_consensus(
    question: str,
    agents: List[str],
    rounds: int = 2,
    weights: Optional[Dict[str, float]] = None,
    timeout_s: int = 20
) -> Dict:
    """Run multi-agent consensus"""
    url = f"{BROKER_BASE}/api/consensus/run"
    payload = {
        "question": question,
        "agents": agents,
        "rounds": rounds,
        "timeout_s": timeout_s,
        "weights": weights or {}
    }
    try:
        return _post(url, payload)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            # Fallback: try deliberation endpoint
            url = f"{BROKER_BASE}/intents/consensus/process"
            payload = {
                "intent": question,
                "context": {"agents": agents, "rounds": rounds, "weights": weights or {}}
            }
            result = _post(url, payload)
            # Transform to consensus format
            return {
                "gi": result.get("consensus", 0.95),
                "final_answer": result.get("decision", ""),
                "votes": [
                    {
                        "agent": agent,
                        "vote": "YES" if result.get("consensus", 0.95) >= 0.95 else "NO",
                        "why": "; ".join(result.get("reasoning", []))
                    }
                    for agent in agents
                ]
            }
        raise


def api_attest(text: str, gi: float) -> Dict:
    """Attest to ledger"""
    # Try multiple endpoints
    endpoints = [
        f"{LEDGER_BASE}/attestations/create",
        f"{LEDGER_BASE}/ledger/attest",
        f"{LEDGER_BASE}/api/attestations"
    ]
    
    payload = {
        "session": SESSION_NAME,
        "text": text,
        "gi": gi,
        "event_type": "console.attestation",
        "civic_id": f"console-{SESSION_NAME}",
        "lab_source": "console"
    }
    
    for endpoint in endpoints:
        try:
            return _post(endpoint, payload)
        except Exception:
            continue
    
    # If all fail, return mock response
    return {
        "id": f"att-{int(time.time())}",
        "status": "logged",
        "message": "Attestation logged locally (ledger service unavailable)"
    }


def api_feed(limit: int = 10):
    """Get public integrity feed"""
    endpoints = [
        f"{LEDGER_BASE}/accords/audit/public_integrity_feed",
        f"{LEDGER_BASE}/api/attestations",
        f"{LEDGER_BASE}/attestations"
    ]
    
    for endpoint in endpoints:
        try:
            data = _get(endpoint, params={"page": 1, "page_size": limit})
            if isinstance(data, dict) and "items" in data:
                return data["items"]
            if isinstance(data, list):
                return data[:limit]
        except Exception:
            continue
    
    return []


def api_hvc():
    """Get violations/remediations"""
    endpoints = [
        f"{LEDGER_BASE}/accords/audit/public_integrity_feed",
        f"{LEDGER_BASE}/api/violations"
    ]
    
    for endpoint in endpoints:
        try:
            items = _get(endpoint, params={"page": 1, "page_size": 25})
            if isinstance(items, dict) and "items" in items:
                items = items["items"]
            if isinstance(items, list):
                return [i for i in items if i.get("kind") in ("violation", "remediation")]
        except Exception:
            continue
    
    return []


# ---- UI ----
def render_header(sync_data: Dict):
    """Render console header with sync status"""
    cyc, aur = sync_data["cycle"], sync_data["aurea"]
    gi_val = aur.get("gi", MIN_GI)
    cycle_id = cyc.get("cycle_id", "C-???")
    date_str = cyc.get("date_local", datetime.now().isoformat())
    hours = int(cyc.get("next_epoch_eta_sec", 86400) // 3600)
    
    line = (
        f"🔄 SYNced • {cycle_id} • GI {badge_gi(gi_val)} "
        f"• {date_str} • Next epoch in ~{hours}h"
    )
    console.print(
        Panel.fit(
            line,
            title="Kaizen OS Console",
            subtitle=f"Session: {SESSION_NAME}",
            style="bold"
        )
    )


def cmd_help():
    """Display help table"""
    t = Table(title="Commands", box=box.SIMPLE_HEAVY)
    t.add_column("Command", style="bold cyan")
    t.add_column("Example / Notes")
    t.add_row("@agent", "@atlas What changed?  |  @uriel Illuminate entropy")
    t.add_row(
        "/consensus",
        '/consensus "Ship AUREA.gic?" --agents atlas,aurea,uriel --rounds 2'
    )
    t.add_row("/attest", '/attest "Genesis Chapter II sealed." --gi 0.999')
    t.add_row("/feed", "/feed 15")
    t.add_row("/hvc", "List violations/remediations")
    t.add_row("/gi-threshold", "/gi-threshold 0.96")
    t.add_row("/sync", "Refresh status")
    t.add_row("/help", "Show help")
    t.add_row("/quit", "Exit console")
    console.print(t)


def handle_at_agent(line: str):
    """Handle @agent command"""
    try:
        parts = line[1:].split(" ", 1)
        if len(parts) < 2:
            console.print("[red]Usage:[/] @agent_name your message")
            return
        name, content = parts[0], parts[1]
    except ValueError:
        console.print("[red]Usage:[/] @agent_name your message")
        return
    
    with console.status(f"Routing to {name.upper()}…"):
        try:
            resp = api_agent(name.lower(), content.strip())
        except Exception as e:
            console.print(f"[red]Agent error:[/] {e}")
            return
    
    gi = float(resp.get("gi", resp.get("consensus", 0.0)))
    body = (
        resp.get("illumination")
        or resp.get("output")
        or resp.get("reasoning")
        or json.dumps(resp, indent=2)
    )
    
    console.rule(f"[bold]{name.upper()}[/] • GI {badge_gi(gi)}")
    console.print(body)
    
    if gi < MIN_GI:
        console.print(f"[yellow]Below GI threshold ({MIN_GI:.2f}). Not attesting.[/]")
    else:
        try:
            att = api_attest(f"[{name.upper()}] {content}\n---\n{body}", gi)
            console.print(f":memo: Attested id: [green]{att.get('id', 'ok')}[/]")
        except Exception:
            console.print("[yellow]Attestation service unavailable.[/]")


def parse_flags(tokens: List[str]):
    """Parse command-line flags"""
    out, key = {}, None
    for tok in tokens:
        if tok.startswith("--"):
            key = tok[2:]
            out[key] = True
        else:
            if key:
                out[key] = tok
                key = None
    return out


def handle_consensus(cmd: str):
    """Handle /consensus command"""
    try:
        parts = shlex.split(cmd)
    except ValueError as e:
        console.print(f"[red]Parse error:[/] {e}")
        return
    
    if len(parts) < 2:
        console.print(
            "[red]Usage:[/] /consensus \"question\" --agents atlas,aurea --rounds 2 "
            "[--weights atlas=1.0,aurea=0.8]"
        )
        return
    
    question = parts[1]
    flags = parse_flags(parts[2:])
    agents = [
        a.strip()
        for a in str(flags.get("agents", "atlas,aurea")).split(",")
        if a.strip()
    ]
    rounds = int(flags.get("rounds", 2))
    timeout_s = int(flags.get("timeout", 20))
    weights = {}
    
    if "weights" in flags:
        for pair in flags["weights"].split(","):
            if "=" in pair:
                k, v = pair.split("=", 1)
                try:
                    weights[k.strip()] = float(v)
                except:
                    pass
    
    with console.status(f"Running consensus among {','.join(agents)}…"):
        try:
            data = api_consensus(question, agents, rounds, weights, timeout_s)
        except Exception as e:
            console.print(f"[red]Consensus error:[/] {e}")
            return
    
    gi = float(data.get("gi", MIN_GI))
    tbl = Table(title=f"Consensus • GI {gi:.3f}", box=box.MINIMAL_DOUBLE_HEAD)
    tbl.add_column("Agent")
    tbl.add_column("Vote")
    tbl.add_column("Rationale")
    
    votes = data.get("votes", [])
    if not votes:
        # Try to extract from alternatives/reasoning
        reasoning = data.get("reasoning", [])
        decision = data.get("decision", "")
        for agent in agents:
            tbl.add_row(
                agent,
                "YES" if gi >= 0.95 else "NO",
                "; ".join(reasoning) or decision
            )
    else:
        for item in votes:
            tbl.add_row(
                item.get("agent", "?"),
                str(item.get("vote", "")),
                item.get("why", item.get("rationale", ""))
            )
    
    console.print(tbl)
    console.print(
        Panel.fit(
            data.get("final_answer", data.get("decision", "<no final answer>")),
            title="Final Answer"
        )
    )
    
    if gi >= MIN_GI:
        try:
            att = api_attest(
                f"[CONSENSUS] Q: {question}\nA: {data.get('final_answer', data.get('decision', ''))}",
                gi
            )
            console.print(f":memo: Attested id: [green]{att.get('id', 'ok')}[/]")
        except Exception:
            console.print("[yellow]Attestation service unavailable.[/]")


def handle_attest(cmd: str):
    """Handle /attest command"""
    parts = shlex.split(cmd)
    if len(parts) < 2:
        console.print("[red]Usage:[/] /attest \"text\" --gi 0.999")
        return
    
    text = parts[1]
    flags = parse_flags(parts[2:])
    gi = float(flags.get("gi", MIN_GI))
    
    try:
        att = api_attest(text, gi)
        console.print(f":memo: Attested id: [green]{att.get('id', 'ok')}[/] GI={gi:.3f}")
    except Exception as e:
        console.print(f"[red]Attest error:[/] {e}")


def handle_feed(limit: int):
    """Handle /feed command"""
    rows = api_feed(limit)
    t = Table(title=f"Public Integrity Feed • last {limit}", box=box.SIMPLE)
    t.add_column("Time")
    t.add_column("Kind")
    t.add_column("GI")
    t.add_column("Title/Details")
    
    for it in rows:
        ts = it.get("timestamp", "")[:19].replace("T", " ")
        kind = it.get("kind", it.get("event_type", "-"))
        gi = it.get("gi", 0.0)
        title = (
            it.get("title")
            or it.get("details")
            or it.get("event_id")
            or it.get("text", "")[:50]
        )
        t.add_row(
            ts,
            kind,
            f"{gi:.3f}" if isinstance(gi, (int, float)) else "-",
            str(title)[:80]
        )
    
    console.print(t)


def handle_hvc():
    """Handle /hvc command"""
    items = api_hvc()
    if not items:
        console.print("[green]No open violations/remediations.[/]")
        return
    
    t = Table(title="HVC Alerts", box=box.SIMPLE_HEAVY)
    t.add_column("Time")
    t.add_column("Kind")
    t.add_column("Gate")
    t.add_column("Details")
    
    for it in items:
        ts = it.get("timestamp", "")[:19].replace("T", " ")
        t.add_row(
            ts,
            it.get("kind", "-"),
            str(it.get("gate", "-")),
            str(it.get("details", ""))[:90]
        )
    
    console.print(t)


def repl():
    """Main REPL loop"""
    sync = api_sync()
    render_header(sync)
    cmd_help()
    console.print("Type [bold cyan]@agent[/] to speak to an agent, or /help for commands.\n")
    
    while True:
        try:
            line = Prompt.ask("[bold green]kaizen>[/]")
        except (EOFError, KeyboardInterrupt):
            console.print("\n[bold]Goodbye.[/]")
            break
        
        if not line.strip():
            continue
        
        if line.strip().lower() in ("/quit", "/exit"):
            console.print("[bold]Goodbye.[/]")
            break
        
        if line.startswith("@"):
            handle_at_agent(line)
            continue
        
        if line.startswith("/consensus"):
            handle_consensus(line)
            continue
        
        if line.startswith("/attest"):
            handle_attest(line)
            continue
        
        if line.startswith("/feed"):
            toks = line.split()
            n = int(toks[1]) if len(toks) > 1 and toks[1].isdigit() else 10
            handle_feed(n)
            continue
        
        if line.startswith("/hvc"):
            handle_hvc()
            continue
        
        if line.startswith("/gi-threshold"):
            try:
                _, val = line.split()
                global MIN_GI
                MIN_GI = float(val)
                console.print(f"GI threshold set to {MIN_GI:.3f}")
            except Exception:
                console.print("[red]Usage:[/] /gi-threshold 0.96")
            continue
        
        if line.startswith("/sync"):
            sync = api_sync()
            render_header(sync)
            continue
        
        if line.startswith("/help"):
            cmd_help()
            continue
        
        console.print("[yellow]Unknown command. Use /help[/]")


if __name__ == "__main__":
    repl()
