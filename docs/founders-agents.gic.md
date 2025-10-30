# DNS + CNAME Integration Guide for .gic Agent Domains

> Use this to route personalized agent domains (e.g. michael.gic, aurea.gic) to your Vercel-hosted Kaizen OS demo.

---

## 🛰️ Step 1: Identify Your Vercel Project's Domain

Find your deploy URL in the Vercel dashboard, e.g.:
```
https://aurea-site-yourvercel.vercel.app
```

---

## 🗂️ Step 2: Add Each Agent Domain to the Vercel Project
- In Vercel dashboard > Project > Settings > Domains, click "Add Domain"
- Enter your agent domain, e.g.: `michael.gic`
- Vercel will show you the CNAME target, e.g.:
```
michael.gic CNAME cname.vercel-dns.com.
```

---

## 📝 Step 3: Add a CNAME Record at Your DNS Provider

For each agent, in your registrar's DNS panel:
| **Host/Name** | **Type** | **Value/Points to**         |
|---------------|----------|-----------------------------|
| michael       | CNAME    | cname.vercel-dns.com        |
| aurea         | CNAME    | cname.vercel-dns.com        |
| atlas         | CNAME    | cname.vercel-dns.com        |
| eve           | CNAME    | cname.vercel-dns.com        |
| zeus          | CNAME    | cname.vercel-dns.com        |
| jade          | CNAME    | cname.vercel-dns.com        |
| kaizen        | CNAME    | cname.vercel-dns.com        |

---
- For a "bare" .gic, use ALIAS/ANAME if supported, else use a www or agent subdomain.

---

## ⏳ Step 4: Wait for DNS to Propagate
- Usually 1–5 minutes, occasionally longer (up to 30).
- Check with [whatsmydns.net](https://www.whatsmydns.net/) or `dig michael.gic`.

---

## ✅ Step 5: Verify in Vercel
- Once DNS is propagated, Vercel will mark domain as "Verified".
- Click the domain in Vercel dashboard, it should route to your live site.
- Visit `https://michael.gic` (or your other agent domain) — confirm you see your Kaizen agent page.

---

## 🚦 TROUBLESHOOTING
- If you see a Vercel error or "Not Found":
    - Double-check CNAME (must be exactly cname.vercel-dns.com)
    - Confirm domain is "Verified" in Vercel
    - Wait a bit longer for DNS, clear browser cache
    - Ensure host-based routing in middleware is set up

---

## 🔁 Adding New Agents
- Repeat steps 2–3 for each new subdomain/agent.
- No limit—add as many agent .gic domains as you wish pointing to this Vercel app.

---

## 🎯 Demo Pattern
- All .gic agent domains (e.g. michael.gic, aurea.gic) → Single Vercel deploy
- Middleware in apps/aurea-site maps host → agentId, enabling a live individual homepage for every agent with per-agent feed and config

---

# Summary Table

| **Domain**    | **Purpose**                   |
|---------------|-------------------------------|
| michael.gic   | Genesis/custodian, demo owner |
| aurea.gic     | Auditor & Protector           |
| atlas.gic     | Builder & Explorer            |
| eve.gic       | Ethics & Civility             |
| zeus.gic      | Sentinel & Arbiter            |
| jade.gic      | Guide & Anchor                |
| kaizen.gic    | Dormant Genesis domain        |


---

> For support, use Vercel logs or dig/nslookup tools. For new deployments, update CNAME, add in Vercel, and you're live within minutes!
