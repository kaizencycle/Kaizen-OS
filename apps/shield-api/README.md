# Lab6-proof — Citizen Shield (MVP)
- /auth/*           -> Civic token flow (same shape as Lab4)
- /shield/sweep     -> records a sweep action (anchors: shield_sweep)
- /shield/report    -> records a report (anchors: shield_report)
- /memory/append    -> shielded memory (anchors: reflection_appended)

ENV:
  LEDGER_API_BASE=https://<your-ledger>.onrender.com

Run:
  uvicorn app.main:app --reload --port 8001
Docs:
  http://localhost:8001/docs


