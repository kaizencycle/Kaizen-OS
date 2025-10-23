# tools/virtue_policy_check.py
"""
Virtue Engine policy gate:
- Changed files under /app, /src, /policy, or any *.md with 'policy'/'ethics' terms
  must contain a doctrine tag and an ID:
    [Ethics] or [Policy] or [Governance]
    Doctrine-ID: <slug-or-uuid>
- Fails closed if requirements are missing.
"""
import sys, re, pathlib

TAG_RE = re.compile(r"\[(Ethics|Policy|Governance)\]")
ID_RE  = re.compile(r"Doctrine-ID:\s*([A-Za-z0-9_\-.:/]+)")

def should_check(path: pathlib.Path) -> bool:
    p = str(path).lower()
    if any(part in ("app", "src", "policy") for part in path.parts):
        return True
    if p.endswith(".md") and any(k in p for k in ("policy", "ethic", "governance", "ktt", "virtue")):
        return True
    return False

def main():
    if len(sys.argv) < 2:
        print("Usage: virtue_policy_check.py <list of files>")
        return 2

    files = [pathlib.Path(p) for p in sys.argv[1:]]
    violations = []

    for f in files:
        if not f.exists():
            continue
        if not should_check(f):
            continue
        text = f.read_text(encoding="utf-8", errors="ignore")
        has_tag = TAG_RE.search(text) is not None
        has_id  = ID_RE.search(text) is not None
        if not (has_tag and has_id):
            violations.append((str(f), has_tag, has_id))

    if violations:
        print("❌ Virtue policy violations:\n")
        for path, tag_ok, id_ok in violations:
            print(f"- {path}: [Ethics/Policy/Governance] tag: {tag_ok}; Doctrine-ID present: {id_ok}")
        print("\nAdd a doctrine tag and a line like: 'Doctrine-ID: VA-2025-01' (or your canonical ID).")
        return 1

    print("✅ Virtue policy check passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())