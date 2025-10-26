# 🕊️ Kaizen OS — Repository Sunset Checklist

**Purpose:**  
This checklist gracefully retires this repository and points contributors to the new **Kaizen OS Monorepo** at  
👉 [https://github.com/kaizencycle/civic-os](https://github.com/kaizencycle/civic-os)

## 🧭 Step 1 — Context

- [ ] Confirm this repository's functions (app/module name, dependencies)
- [ ] Note any active API keys, Render connections, or secrets
- [ ] Identify any workflows still linked to this repo (GitHub Actions, Render cron, etc)

## 🪞 Step 2 — Documentation

- [ ] Edit README.md to include this banner at the very top:

```markdown
> **Status: Deprecated / Archived**
>
> This project has been merged into the **Kaizen OS Monorepo**:  
> https://github.com/kaizencycle/civic-os  
>  
> Future work and issues will occur there. This repo remains read-only for historical reference.
```

- [ ] Update repo description to "📦 Archived — merged into Kaizen OS Monorepo"

## 🗄️ Step 3 — Code Lockdown

- [ ] Protect main branch (Settings → Branches → Protect main)
- [ ] Disable GitHub Actions and Dependabot
- [ ] Tag final state:

```bash
git tag v0-archived
git push origin v0-archived
```

- [ ] Archive the repo (Settings → Archive this repository)

## 🧱 Step 4 — Ledger Traceability

- [ ] Record the archive hash and date in your Civic Ledger (Cycle log entry)
- [ ] Note which Kaizen OS directory the code migrated into (e.g., /apps/hive-app)

## ⚙️ Step 5 — Optional Transfer

If you want to keep a clean namespace:
- [ ] Transfer to kaizen-archive org (retains links)
- [ ] Verify redirect works from original URL

## ✅ Step 6 — Confirmation

Once all above are checked:
- [ ] Post final comment:  
🕊️ *Archived successfully — merged into Kaizen OS Monorepo at commit [hash].*  
*Integrity and lineage preserved.*

---

**Note:** This checklist ensures a clean transition while preserving the integrity and provenance of your codebase within the Kaizen OS ecosystem.

