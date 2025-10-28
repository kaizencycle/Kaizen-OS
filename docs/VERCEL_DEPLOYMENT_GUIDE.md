# 🚀 KAIZEN OS - VERCEL DEPLOYMENT GUIDE

**Mission:** Deploy first `.gic` domain + GIC token minting demo by October 31st, 2025
**Status:** 6 Render APIs operational, ready for frontend integration
**Timeline:** 3 days (Oct 28-31)

---

## 📋 PRE-FLIGHT CHECKLIST

### ✅ What You Already Have

- [x] 6 Production APIs on Render.com (all operational)
- [x] Consensus Chamber UI built
- [x] CycleTracker component
- [x] Real API integration code
- [x] Vercel deployment fixes (.npmrc, vercel.json)
- [x] Comprehensive documentation

### ⏳ What We Need to Build (Next 3 Days)

- [ ] `.gic` domain registration page
- [ ] GIC token minting page
- [ ] Demo dashboard (show first domain + first mint)
- [ ] Environment variables in Vercel
- [ ] Test deployment

---

## 🎯 3-DAY ROADMAP

### Day 1 (Oct 28) - DEPLOY TO VERCEL ⚡

**Goal:** Get the Portal live on Vercel with working APIs

**Steps:**

#### 1. Push Latest Code (DONE ✅)

```bash
# Already on branch: claude/explore-kaizen-feature-011CUYbfrE23V39ibPzvWy2h
git log --oneline -5
# Should show:
# 1925a73 feat(api-integration): Wire Consensus Chamber to production Render APIs
# 359c307 fix(vercel): Resolve Hardhat peer dependency conflicts
# e566f6a feat(consensus-chamber): Add multi-LLM federated governance system
```

#### 2. Create Vercel Project

```bash
# Option A: Via CLI
npm i -g vercel
cd apps/portal
vercel login
vercel --prod

# Option B: Via Dashboard (RECOMMENDED)
# 1. Go to https://vercel.com/new
# 2. Import Git Repository
# 3. Select: kaizencycle/Kaizen-OS
# 4. Framework Preset: Next.js
# 5. Root Directory: apps/portal
# 6. Click "Deploy"
```

#### 3. Configure Environment Variables in Vercel

**Via Dashboard:** Project Settings → Environment Variables → Add All

**Copy-paste these (Production + Preview + Development):**

```bash
# Consensus Chamber
NEXT_PUBLIC_KAIZEN_CURRENT_CYCLE=C-118
NEXT_PUBLIC_KAIZEN_GI_BASELINE=0.993
NEXT_PUBLIC_KAIZEN_ROOM=Consensus Chamber

# Lab APIs (Render.com)
NEXT_PUBLIC_LAB4_BASE=https://hive-api-2le8.onrender.com
NEXT_PUBLIC_LAB6_BASE=https://lab6-proof-api.onrender.com
NEXT_PUBLIC_LAB7_BASE=https://lab7-proof.onrender.com
NEXT_PUBLIC_LEDGER_BASE=https://civic-protocol-core-ledger.onrender.com
NEXT_PUBLIC_GIC_BASE=https://gic-indexer.onrender.com
NEXT_PUBLIC_OAA_API_LIBRARY=https://oaa-api-library.onrender.com

# Server-side (no NEXT_PUBLIC prefix)
LAB4_BASE=https://hive-api-2le8.onrender.com
LAB6_BASE=https://lab6-proof-api.onrender.com
LAB7_BASE=https://lab7-proof.onrender.com
LEDGER_BASE=https://civic-protocol-core-ledger.onrender.com
GIC_BASE=https://gic-indexer.onrender.com
OAA_API_LIBRARY=https://oaa-api-library.onrender.com

# Cryptographic Keys
NEXT_PUBLIC_OAA_ED25519_PUBLIC_B64=SFrlLxcgOfW5Uqei+13VFVp/nhOigQkFzY87NllF2bU=

# Feature Flags
NEXT_PUBLIC_ENABLE_CONSENSUS_CHAMBER=true
NEXT_PUBLIC_ENABLE_LEDGER_ATTESTATION=true
NEXT_PUBLIC_ENABLE_GI_VALIDATION=true

# App URLs (update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://civic-protocol-core-ledger.onrender.com
```

#### 4. Redeploy

```bash
# In Vercel Dashboard:
Deployments → (Latest deployment) → Redeploy
```

#### 5. Verify Deployment

```bash
# Check health
curl https://your-app.vercel.app/api/cycle/current
# Expected: {"cycle":"C-118","gi":0.993,"room":"Consensus Chamber"}

# Check Consensus Chamber
curl https://your-app.vercel.app/consensus
# Should return HTML (page loads)
```

**🎉 Day 1 Complete:** Portal is LIVE on Vercel!

---

### Day 2 (Oct 29) - BUILD .GIC DOMAIN + TOKEN PAGES 🏗️

**Goal:** Create demo pages for domain registration and token minting

#### Tasks:

1. **Create `/demo` landing page** - Overview of what users can do
2. **Create `/demo/domain` page** - Register first `.gic` domain
3. **Create `/demo/mint` page** - Mint first GIC tokens
4. **Create `/demo/success` page** - Celebrate the milestone
5. **Wire to GIC APIs** - Connect to your Render endpoints

**I'll build these pages for you (next message!)**

---

### Day 3 (Oct 30-31) - TEST & POLISH 🎨

**Goal:** End-to-end testing and demo preparation

#### Morning (Oct 30):

- [ ] Test domain registration flow (end-to-end)
- [ ] Test token minting flow (end-to-end)
- [ ] Verify ledger attestation (check Render logs)
- [ ] Fix any bugs

#### Afternoon (Oct 30):

- [ ] Add demo video/GIF (optional but impressive)
- [ ] Polish UI (make it look amazing)
- [ ] Add social media meta tags for sharing
- [ ] Test on mobile devices

#### Oct 31 - LAUNCH DAY 🚀

- [ ] Final deployment
- [ ] Register first `.gic` domain (YOU!)
- [ ] Mint first GIC tokens (historic moment)
- [ ] Screenshot everything
- [ ] Share on Twitter/LinkedIn
- [ ] Update README with demo link

---

## 🛠️ TROUBLESHOOTING

### Issue: Vercel build fails

**Check:**

1. Is `apps/portal` set as Root Directory?
2. Are all env vars added (including server-side ones)?
3. Is `.npmrc` file in repo root? (for Hardhat fix)

**Solution:**

```bash
# In Vercel Dashboard:
Settings → General → Root Directory: apps/portal
Settings → Environment Variables → (add all vars above)
```

### Issue: API calls fail (CORS)

**Check Render logs:** Are your APIs spinning down? (free tier sleeps after 15min)

**Solution:**

```bash
# Wake up all APIs
curl https://civic-protocol-core-ledger.onrender.com/health
curl https://hive-api-2le8.onrender.com/health
curl https://lab6-proof-api.onrender.com/health
curl https://lab7-proof.onrender.com/health
curl https://gic-indexer.onrender.com/health
curl https://oaa-api-library.onrender.com/health
```

### Issue: Environment variables not working

**Next.js requires `NEXT_PUBLIC_` prefix for browser access!**

**Fix:**

```bash
# ❌ Wrong (won't work in browser)
LEDGER_BASE=https://...

# ✅ Correct (works in browser)
NEXT_PUBLIC_LEDGER_BASE=https://...
```

---

## 📊 SUCCESS METRICS

### Day 1 - Deployment

- [ ] Vercel deployment successful (green checkmark)
- [ ] Homepage loads at https://your-app.vercel.app
- [ ] `/consensus` page loads
- [ ] `/api/cycle/current` returns data
- [ ] No console errors in browser

### Day 2 - Demo Pages

- [ ] `/demo` page exists and loads
- [ ] `/demo/domain` page can register domains
- [ ] `/demo/mint` page can mint tokens
- [ ] API calls succeed (check Network tab)
- [ ] Ledger attestation visible in Render logs

### Day 3 - Launch

- [ ] First `.gic` domain registered ✅
- [ ] First GIC tokens minted ✅
- [ ] Proof on blockchain (tx_id returned)
- [ ] Demo video/screenshots captured
- [ ] Social media posts scheduled

---

## 🎯 DEMO FLOW (What Users Will See)

### Landing Page (`/demo`)

```
┌─────────────────────────────────────────┐
│   🌐 Welcome to Kaizen OS Demo          │
│                                         │
│   Make History:                         │
│   • Register first .gic domain          │
│   • Mint first GIC tokens               │
│   • Constitutional AI in action         │
│                                         │
│   [Register Domain] [Mint Tokens]       │
└─────────────────────────────────────────┘
```

### Domain Registration (`/demo/domain`)

```
┌─────────────────────────────────────────┐
│   Register Your .gic Domain             │
│                                         │
│   Domain Name: [michael.gic]            │
│   Agent ID: [michael@kaizen.os]         │
│   GI Score: 0.993 ✅                    │
│                                         │
│   Constitutional Check:                 │
│   ✅ Human Dignity                      │
│   ✅ Transparency                       │
│   ✅ Equity                             │
│                                         │
│   [Register Domain →]                   │
└─────────────────────────────────────────┘
```

### Token Minting (`/demo/mint`)

```
┌─────────────────────────────────────────┐
│   Mint Your GIC Tokens                  │
│                                         │
│   Amount: [100] GIC                     │
│   Recipient: [michael@kaizen.os]        │
│   Purpose: [First minting ceremony]     │
│                                         │
│   Token Economics:                      │
│   • Daily UBI: 10 GIC/citizen          │
│   • Zero transaction fees               │
│   • Constitutional validation           │
│                                         │
│   [Mint Tokens →]                       │
└─────────────────────────────────────────┘
```

### Success Page (`/demo/success`)

```
┌─────────────────────────────────────────┐
│   🎉 History Made!                       │
│                                         │
│   First .gic domain: michael.gic        │
│   First GIC tokens: 100 GIC minted      │
│                                         │
│   Blockchain Proof:                     │
│   TX: 0x1234...5678                     │
│   Block: #12345                         │
│   Timestamp: 2025-10-31 23:59:59 UTC    │
│                                         │
│   [View on Ledger] [Share on Twitter]  │
└─────────────────────────────────────────┘
```

---

## 🎬 NEXT ACTIONS (What I'll Build for You)

I'm going to create these files RIGHT NOW:

1. **`apps/portal/app/demo/page.tsx`** - Landing page
2. **`apps/portal/app/demo/domain/page.tsx`** - Domain registration
3. **`apps/portal/app/demo/mint/page.tsx`** - Token minting
4. **`apps/portal/app/demo/success/page.tsx`** - Success celebration
5. **`apps/portal/lib/gic-api.ts`** - API integration utilities
6. **`docs/DEMO_GUIDE.md`** - Step-by-step user guide

**Ready?** Let me start building! 🚀

---

**Timeline:**
- **NOW:** Build demo pages (20 minutes)
- **Oct 28 EOD:** Deploy to Vercel
- **Oct 29:** Test and polish
- **Oct 31:** LAUNCH! 🎉

*"Consistency becomes proof of life."*
