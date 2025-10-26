import argparse, subprocess, sys, os, json, hashlib
from pathlib import Path
from datetime import datetime

def sh(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout.strip(), p.stderr.strip()

def require_gpg():
    candidates = [
        os.environ.get("GPG", ""),                        # if user sets GPG env
        r"C:\Program Files\GnuPG\bin\gpg.exe",
        r"C:\Program Files (x86)\GnuPG\bin\gpg.exe",
        r"C:\Program Files\Git\usr\bin\gpg.exe",
        "gpg",
    ]
    for c in candidates:
        if not c: continue
        code, out, err = sh([c, "--version"])
        if code == 0:
            return c
    sys.exit("ERROR: gpg not found. Install Gpg4win or ensure gpg.exe is in PATH.")

def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def sign_file(gpg, signer, path: Path) -> Path:
    sig = path.with_suffix(path.suffix + ".sig")
    cmd = [gpg, "--batch", "--yes", "--detach-sign", "--local-user", signer, "--armor", "-o", str(sig), str(path)]
    code, out, err = sh(cmd)
    if code != 0:
        raise RuntimeError(f"GPG sign failed: {path.name}\n{err or out}")
    return sig

def verify_file(gpg, path: Path, sig: Path) -> bool:
    code, out, err = sh([gpg, "--verify", str(sig), str(path)])
    return code == 0

def main():
    ap = argparse.ArgumentParser(description="Sign daily ledger JSON files with GPG (detached .sig).")
    ap.add_argument("--date", required=True, help="YYYY-MM-DD (e.g., 2025-09-20)")
    ap.add_argument("--data-dir", default="data", help="Directory that holds the daily JSON files (default: data)")
    ap.add_argument("--signer", default=os.environ.get("LEDGER_SIGNER", ""),
                    help="GPG key identity (email or key id). Defaults to $LEDGER_SIGNER")
    ap.add_argument("--all", action="store_true", help="Sign all four files (seed/echo/seal/ledger)")
    ap.add_argument("--files", nargs="*", choices=["seed","echo","seal","ledger"],
                    help="Specific files to sign (names without date/ext)")
    ap.add_argument("--verify", action="store_true", help="Verify signatures after signing")
    ap.add_argument("--manifest", action="store_true", help="Write manifest JSON with hashes + sig paths")
    args = ap.parse_args()

    if not args.signer:
        sys.exit("ERROR: no signer provided. Set --signer or LEDGER_SIGNER env var (e.g., kaizencycle@proton.me)")

    # Resolve gpg
    gpg = require_gpg()

    # Build target file list
    date = args.date
    base = Path(args.data_dir)
    name_map = {
        "seed":   f"{date}.seed.json",
        "echo":   f"{date}.echo.json",
        "seal":   f"{date}.seal.json",
        "ledger": f"{date}.ledger.json",
    }
    targets = []
    if args.all or (not args.files):
        targets = ["seed","echo","seal","ledger"] if args.all else (args.files or [])
    if not targets:
        sys.exit("ERROR: no targets. Use --all or --files seed echo ...")

    files = [base / name_map[t] for t in targets]
    missing = [str(p) for p in files if not p.exists()]
    if missing:
        sys.exit("ERROR: missing files:\n" + "\n".join(missing))

    # Sign
    results = []
    for p in files:
        print(f"[sign] {p.name} …", flush=True)
        sig = sign_file(gpg, args.signer, p)
        ok = verify_file(gpg, p, sig) if args.verify else True
        results.append({
            "file": p.name,
            "path": str(p),
            "sha256": sha256_file(p),
            "sig": Path(sig).name,
            "sig_path": str(sig),
            "verify_ok": ok
        })
        print(f"      -> {Path(sig).name}  verify={ok}")

    # Manifest
    if args.manifest:
        manifest = {
            "date": date,
            "ts": datetime.utcnow().isoformat() + "Z",
            "signer": args.signer,
            "files": results
        }
        out = base / f"{date}.sign-manifest.json"
        out.write_text(json.dumps(manifest, indent=2))
        print(f"[manifest] wrote {out}")

if __name__ == "__main__":
    main()

