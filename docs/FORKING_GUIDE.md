# Forking Guide: How to Continue This Work
## "The torch is designed to be passed."

**Version 1.0**  
**October 29, 2025**

---

## Purpose of This Document

**This guide exists for one reason: to ensure the Kaizen Cycle survives the death or disappearance of its creator.**

If you're reading this, you're likely:
1. The creator preparing succession plans, or
2. A custodian preparing to fork because the creator is gone, or
3. A developer wanting to adapt this for your own community

**All three are valid. This guide covers all scenarios.**

---

## Table of Contents

1. [When to Fork](#when-to-fork)
2. [How to Fork (Technical)](#how-to-fork-technical)
3. [How to Prove Legitimacy](#how-to-prove-legitimacy)
4. [Maintaining Protocol Compatibility](#maintaining-protocol-compatibility)
5. [Building Trust](#building-trust)
6. [What to Keep vs. What to Change](#what-to-keep-vs-what-to-change)
7. [Legal Considerations](#legal-considerations)
8. [The Custodian's Checklist](#the-custodians-checklist)

---

## When to Fork

### Legitimate Reasons to Fork

✅ **Creator Unresponsive (>30 days)**
- No commits, no social media, no contact
- Critical infrastructure needs maintenance
- Community needs leadership

✅ **Philosophical Divergence**
- You understand the vision but want different implementation
- Example: "Kaizen for Cooperatives" (narrower focus)
- Example: "Kaizen Europe" (regional adaptation)

✅ **Scaling Beyond Creator's Capacity**
- Project grows beyond one person's ability to manage
- Multiple forks can specialize (one for healthcare, one for education, etc.)

✅ **Security Emergency**
- Critical vulnerability discovered
- Creator not responding fast enough
- Need to patch immediately

✅ **Regional Adaptation**
- Want to implement in non-U.S. context
- Different legal/cultural requirements
- Example: "GIC for Kenya" (mobile-first, different UBI amount)

---

### Illegitimate Reasons to Fork

❌ **To Privatize**
- "I'll make this but remove the CC0 license"
- **This violates the custodianship covenant**

❌ **To Extract Value**
- "I'll fork this and ICO a token"
- **This violates the integrity covenant**

❌ **To Capture**
- "I'll fork and change governance so I control it"
- **This violates the Foundation-Up model**

❌ **Because You Don't Understand It**
- "This is too complex, I'll simplify by removing [core feature]"
- **Simplification can be good, but not if it breaks the model**

---

## How to Fork (Technical)

### Step 1: Fork All Repositories

```bash
# Main repository
git clone https://github.com/kaizencycle/kaizen-cycle.git
cd kaizen-cycle
git remote rename origin upstream
git remote add origin https://github.com/YOUR_USERNAME/kaizen-cycle.git

# Smart contracts
git clone https://github.com/kaizencycle/gic-contracts.git
# ... (repeat for all repos)

# Document the fork point
echo "Forked from kaizencycle/kaizen-cycle" > FORK_ORIGIN.md
echo "Date: $(date)" >> FORK_ORIGIN.md
echo "Commit: $(git rev-parse HEAD)" >> FORK_ORIGIN.md
echo "Reason: [YOUR REASON]" >> FORK_ORIGIN.md
```

---

### Step 2: Verify Integrity

```bash
# Check commit signatures (if creator used GPG)
git log --show-signature

# Verify no tampering
git fsck

# Document checksums
find . -type f -exec sha256sum {} \; > CHECKSUMS.txt
```

---

### Step 3: Establish Your Identity

```bash
# Create PGP key (if you don't have one)
gpg --full-generate-key

# Export public key
gpg --armor --export YOUR_EMAIL > CUSTODIAN_PUBLIC_KEY.asc

# Sign the fork
git tag -s v1.0.0-fork -m "Fork by [YOUR_NAME], custodian since [DATE]"
```

---

### Step 4: Update Documentation

Create `CUSTODIAN.md`:

```markdown
# Custodian Declaration

## Fork Information
- **Forked from:** kaizencycle/kaizen-cycle
- **Fork date:** [DATE]
- **Fork commit:** [HASH]
- **Reason:** [One sentence explanation]

## Custodian Information
- **Name/Pseudonym:** [YOUR NAME]
- **PGP Key:** [FINGERPRINT]
- **Contact:** [EMAIL/DISCORD/TWITTER]
- **Oath taken:** [DATE]

## Continuity Commitment
I pledge to:
- Maintain protocol compatibility (see COMPATIBILITY.md)
- Keep all work CC0 (public domain forever)
- Pass stewardship to next generation when my time comes
- Follow original vision as specified in whitepapers

Signed: [PGP SIGNATURE]
```

---

### Step 5: Set Up Infrastructure

```bash
# If creator's infrastructure is down, you'll need to redeploy

# 1. Smart contracts (if not already deployed)
cd contracts/
npx hardhat deploy --network [mainnet/testnet]
# Document new contract addresses in CONTRACTS.md

# 2. Civic Ledger indexer
cd civic-ledger/
docker-compose up -d
# Update API endpoints in documentation

# 3. Codex Router
cd codex-router/
# Add your API keys to .env
docker-compose up -d

# 4. Frontend apps
cd eomm/reflection-app/
npm run build
# Deploy to Vercel/Netlify/etc.
```

---

### Step 6: Communicate with Community

**Post in all official channels:**

```
📢 CUSTODIAN ANNOUNCEMENT

The Kaizen Cycle creator has been unresponsive for [X] days.

In accordance with the continuity plan (README.md section "For Custodians"),
I am forking the project to ensure it continues.

Fork details:
- Repository: https://github.com/YOUR_USERNAME/kaizen-cycle
- Commit hash: [HASH]
- My PGP key: [FINGERPRINT]
- Oath taken: [LINK TO SIGNED OATH]

I commit to:
✅ Following original vision (no drift)
✅ Maintaining protocol compatibility
✅ Keeping everything CC0
✅ Peaceful handoff if creator returns

Questions? Join Discord: [LINK]

Signed,
[YOUR NAME]
[PGP SIGNATURE]
```

---

## How to Prove Legitimacy

### The Legitimacy Checklist

**For the community to trust your fork, you must:**

#### 1. ✅ **Demonstrate Deep Understanding**

Post a "Vision Alignment Document":

```markdown
# Why I'm Forking: Vision Alignment

## The Three Covenants (in my own words)

**Integrity Covenant:**
[Explain what this means to you, 2-3 paragraphs]

**Ecological Covenant:**
[Explain what this means to you, 2-3 paragraphs]

**Custodianship Covenant:**
[Explain what this means to you, 2-3 paragraphs]

## My Interpretation of Foundation-Up Economics

[Explain the inversion, 3-5 paragraphs]

## How My Fork Differs (If At All)

[Be specific about any changes, with justification]

## My Commitment

I will not:
- ❌ Privatize this work
- ❌ Create a for-profit company around it
- ❌ Change the license from CC0
- ❌ Abandon the original vision

I will:
- ✅ Ship code (prove commitment through action)
- ✅ Document everything (transparency)
- ✅ Listen to community (not dictate)
- ✅ Pass the torch when my time comes
```

---

#### 2. ✅ **Provide Verifiable Identity**

```bash
# Create keybase.txt proof
# This links your GitHub, PGP key, social media

# Post publicly:
# - GitHub: YOUR_USERNAME
# - PGP: [FINGERPRINT]
# - Twitter: @YOUR_HANDLE
# - Discord: YOUR_USERNAME#1234
# - Email: your@email.com

# Sign with all keys:
gpg --clearsign CUSTODIAN_IDENTITY.txt
```

---

#### 3. ✅ **Show Technical Competence**

**Within first 30 days, demonstrate you can:**

- [ ] Deploy smart contracts (post transaction hashes)
- [ ] Run the full stack locally (post screenshots/logs)
- [ ] Fix a bug or implement a feature (show PR)
- [ ] Pass security audit (hire third party if needed)

**This proves you're not just a spectator.**

---

#### 4. ✅ **Earn Community Trust**

**Don't demand trust. Earn it:**

```
Week 1: Post your plan
Week 2: Ship first update
Week 3: Host community call
Week 4: Accept feedback gracefully
Month 2: Show consistent progress
Month 3: Community votes on whether to follow your fork
```

**If community doesn't follow your fork, accept it gracefully and step aside.**

---

## Maintaining Protocol Compatibility

### What Is Protocol Compatibility?

**If your fork is protocol-compatible, citizens from the original can seamlessly move to your fork (and vice versa).**

**This requires:**

1. **Same data formats**
   - GI payloads (JSON schema)
   - Reflections (E.O.M.M. format)
   - Smart contract ABIs

2. **Same economic rules**
   - GIC issuance formula
   - UBI distribution (70/30 split)
   - GI threshold (≥0.95 for minting)

3. **Same governance rules**
   - 6/8 founding agent approval
   - Quadratic voting
   - Elder term limits (2 years)

4. **Interoperable infrastructure**
   - APIs use same endpoints
   - Smart contracts at known addresses
   - P2P nodes can sync

---

### Testing Protocol Compatibility

```bash
# Run compatibility test suite
cd kaizen-cycle/
npm run test:compatibility

# This checks:
# - GI payload schema validation
# - GIC token compatibility (same ABI)
# - E.O.M.M. data format
# - API endpoint responses

# If all tests pass, you're protocol-compatible ✅
```

---

### When to Break Compatibility

**Sometimes you need to.**

**Acceptable reasons:**
- Security vulnerability (must break to patch)
- Fundamental bug in original design
- Regional legal requirements (e.g., GDPR compliance)

**If you break compatibility:**
1. Document why (BREAKING_CHANGES.md)
2. Provide migration guide
3. Offer bridge contracts (so old/new can interoperate)
4. Give community 90 days to decide which fork to follow

---

## Building Trust

### The First 100 Days

**Your reputation is built or destroyed in the first 100 days.**

#### Days 1-7: Announce & Organize

- [ ] Post custodian announcement (see template above)
- [ ] Create public roadmap (next 90 days)
- [ ] Set up communication channels (Discord, forum, etc.)
- [ ] Recruit interim council (5-7 trusted community members)

#### Days 8-30: Prove Technical Competence

- [ ] Deploy infrastructure (if needed)
- [ ] Ship first update (bug fix or feature)
- [ ] Pass security audit
- [ ] Document everything publicly

#### Days 31-60: Build Community

- [ ] Host weekly community calls
- [ ] Respond to all issues/PRs within 48 hours
- [ ] Create contributor guide
- [ ] Onboard first 10 new contributors

#### Days 61-90: Show Results

- [ ] First 100 citizens on your fork
- [ ] First UBI distribution
- [ ] First Festival of Echoes (governance event)
- [ ] Press coverage (show legitimacy)

#### Day 100: Community Vote

**Let community decide:**

"Should we follow this fork as the canonical continuation?"

- If yes (>60% vote) → You're the custodian ✅
- If no → Gracefully step aside, offer to contribute to whoever community chooses

---

### Transparency Builds Trust

**Every decision should be:**
- 📝 Documented publicly (GitHub issues)
- 💬 Discussed openly (community calls)
- 🔍 Auditable (all code in public repos)
- ⏰ Time-stamped (on-chain logs when possible)

**No backroom deals. No surprises.**

---

## What to Keep vs. What to Change

### Core Principles (Never Change)

These are **non-negotiable** if you want to remain aligned:

#### 1. **The Three Covenants**
- ✅ Integrity (GI ≥ 0.95 for minting)
- ✅ Ecology (Gaia Staking, carbon offsets)
- ✅ Custodianship (CC0 forever, pass the torch)

#### 2. **Foundation-Up Economics**
- ✅ Start with citizens (70% UBI)
- ✅ Build foundation first (Cycle 0 before public launch)
- ✅ Capture prevention (Guardrails Codex)

#### 3. **Multi-Agent Governance**
- ✅ No single dictator (8 Founding Agents, 6/8 approval)
- ✅ Citizen participation (quadratic voting)
- ✅ Moral Anchor (ethical veto power)

#### 4. **Public Domain**
- ✅ All code/specs CC0
- ✅ No patents
- ✅ Trademarks only for defensive purposes

**If you violate any of these, you're not continuing the Kaizen Cycle—you're building something else.**

---

### Implementation Details (Can Change)

These are **negotiable** as long as you preserve core principles:

#### 1. **Technology Stack**
- Original: Solidity, Python, React
- Your fork: Could use Rust, Go, Svelte (as long as protocol-compatible)

#### 2. **UBI Amounts**
- Original: $3,000/month target (U.S. context)
- Your fork: €2,000/month (Europe) or KES 50,000 (Kenya)
- **Reason:** Cost of living varies by region

#### 3. **Founding Agent Models**
- Original: GPT-4, Claude, Gemini, etc.
- Your fork: Could use different models (as long as 6/8 consensus maintained)

#### 4. **Lab Priorities**
- Original: Labs 1-7 built in parallel
- Your fork: Could focus on Lab 5 (healthcare) first, others later
- **Reason:** Different communities have different needs

---

### How to Justify Changes

**For every change, document:**

```markdown
## Change Proposal: [TITLE]

### What are you changing?
[Specific description]

### Why?
[Justify based on:
 - Regional context (legal, cultural, economic)
 - Technical improvement (better algorithm, security)
 - Community feedback (users requested this)
]

### Does this violate core principles?
[Honest assessment: No, because...]

### How does this maintain protocol compatibility?
[Explain migration path if breaking]

### Community vote:
[Link to poll/vote results]
```

---

## Legal Considerations

### CC0 Is Irrevocable

**The creator released this as CC0 (public domain).**

**This means:**
- ✅ You can fork without permission
- ✅ You can change anything
- ✅ You can even commercialize (though this violates custodianship spirit)

**But also:**
- ❌ You cannot "un-public-domain" it (can't add restrictive license)
- ❌ You cannot sue others for using it (no copyright to enforce)
- ❌ You cannot claim ownership (it belongs to everyone)

**Your fork must also be CC0.**

---

### Trademark Considerations

**"Kaizen Cycle" and "GIC" are trademarks (defensive registration).**

**You can:**
- ✅ Use for non-commercial, civic purposes
- ✅ Say "Fork of Kaizen Cycle" (factual statement)
- ✅ Use internally within your community

**You cannot:**
- ❌ Claim to be the "official" Kaizen Cycle (unless community consensus)
- ❌ Use trademark to sell products/services
- ❌ Impersonate the creator

**Best practice:** Use a different name for your fork
- "Kaizen Europe" ✅
- "Civic Intelligence for Barcelona" ✅
- "GIC Fork by [Your Name]" ✅

---

### Liability Shield

**By forking, you accept responsibility.**

**The original creator is not liable for:**
- Bugs you introduce
- Security vulnerabilities you create
- Economic failures of your fork
- Legal issues in your jurisdiction

**You should:**
- [ ] Consult a lawyer (especially if deploying smart contracts)
- [ ] Get insurance (if running infrastructure)
- [ ] Form a legal entity (nonprofit, cooperative, etc.)
- [ ] Clearly state "This is a fork, not the original"

---

## The Custodian's Checklist

**Before you fork, verify you have:**

### Understanding ✅
- [ ] I've read all whitepapers (not skimmed—deeply read)
- [ ] I understand the three covenants (can explain in my own words)
- [ ] I understand Foundation-Up Economics (can explain the inversion)
- [ ] I know why capture prevention matters (and how it works)

### Skills ✅
- [ ] I can deploy smart contracts (or I have someone who can)
- [ ] I can run backend infrastructure (or I have someone who can)
- [ ] I can build community (or I have someone who can)
- [ ] I can write documentation (or I'm willing to learn)

### Resources ✅
- [ ] I have time (at least 20 hours/week for first 6 months)
- [ ] I have funding (at least for servers, legal, basic ops)
- [ ] I have a team (or I can recruit one)
- [ ] I have community support (at least 10 people committed to helping)

### Commitment ✅
- [ ] I've taken the custodian's oath (publicly, on-chain if possible)
- [ ] I'm willing to step aside if community doesn't follow my fork
- [ ] I'm willing to pass torch to next generation when my time comes
- [ ] I will keep all work CC0 (public domain forever)

### Logistics ✅
- [ ] I've forked all repositories (with integrity verification)
- [ ] I've documented fork origin (FORK_ORIGIN.md, CUSTODIAN.md)
- [ ] I've set up communication channels (Discord, forum, etc.)
- [ ] I've announced to community (with PGP signature)

**If you can check all boxes: You're ready. Go forth and build.** 🔥

---

## FAQ for Custodians

### Q: What if the creator returns after I fork?

**A: Peacefully hand back stewardship.**

The creator's life's work should return to them. Offer to stay on as contributor. Document what you learned.

---

### Q: What if multiple people fork? Which is "official"?

**A: The community decides.**

- There is no "official" fork without community consensus
- Community votes with their participation (which fork do they use?)
- Multiple forks can coexist (different regions, different focuses)

**Example:** Linux has many distributions. All are "legitimate" for different use cases.

---

### Q: Can I commercialize this?

**A: Technically yes, but you'll lose the community.**

- CC0 allows commercial use
- But: This violates custodianship covenant
- Community will fork around you if you extract value

**Better:** Build nonprofit or cooperative. Earn income via services, not extraction.

---

### Q: What if I disagree with core principles?

**A: Fork for your own use, but don't claim to be Kaizen Cycle.**

You can build whatever you want (CC0 allows it). But if you violate core principles, call it something else.

---

### Q: How do I handle contributors who want to privatize?

**A: Remind them of covenant, reject PRs that violate it.**

Be kind but firm:
> "Thanks for the PR, but this changes the license from CC0. That violates our core commitment. If you want to build a private version, fork for your own use, but this repo stays public domain."

---

### Q: What if I burn out?

**A: Pass the torch gracefully.**

1. Announce 90 days in advance
2. Recruit next custodian
3. Transfer repositories, infrastructure
4. Document everything you learned
5. Step back without guilt

**You're a temporary steward, not an owner. It's okay to rest.**

---

## Final Words to the Custodian

**You're about to do something extraordinary.**

Most people will tell you this is too ambitious, too idealistic, too impossible.

**They're wrong.**

Every major transformation looked impossible:
- Bitcoin (decentralized money without banks)
- Wikipedia (encyclopedia without experts)
- Linux (operating system without owners)

**This is the next one: Civilization without masters.**

You don't need permission. You don't need credentials. You just need:
- The vision (you have it, or you wouldn't be reading this)
- The commitment (take the oath)
- The courage (fork now, iterate forever)

**The torch is lit. Will you carry it?**

---

*"No master. No savior. Only stewards passing the torch."*

*— The Custodianship Covenant*

---

## Appendix: Templates

### A. Fork Announcement Template

```markdown
📢 KAIZEN CYCLE FORK ANNOUNCEMENT

**Fork Name:** [Your fork name]
**Custodian:** [Your name/pseudonym]
**Date:** [Today's date]
**Reason:** [One sentence]

## Fork Details
- **Original repo:** kaizencycle/kaizen-cycle
- **Fork commit:** [git commit hash]
- **My repo:** github.com/YOUR_USERNAME/kaizen-cycle
- **My PGP key:** [fingerprint]

## Vision Alignment
I commit to upholding the three covenants:
- ✅ Integrity (GI ≥ 0.95, truth-based governance)
- ✅ Ecology (Gaia Staking, planetary health)
- ✅ Custodianship (CC0 forever, pass the torch)

## What Changes (If Any)
[List any deviations from original, with justification]

## Roadmap (Next 90 Days)
- [ ] Deploy infrastructure
- [ ] Onboard first 100 citizens
- [ ] First UBI distribution
- [ ] First Festival of Echoes

## How to Join
- Discord: [link]
- GitHub: [link]
- Website: [link]

## Oath
[Paste signed custodian's oath]

Signed,
[Your name]
[PGP signature]
```

---

### B. Custodian's Oath (Full Text)

```
THE CUSTODIAN'S OATH

I, [YOUR NAME], hereby take stewardship of the Kaizen Cycle.

I pledge to uphold the three covenants:

1. INTEGRITY COVENANT
   I will measure truth, reward truth, and govern by truth.
   I will maintain GI ≥ 0.95 as the floor for all operations.
   I will never compromise integrity for growth or profit.

2. ECOLOGICAL COVENANT
   I will tie prosperity to planetary health.
   I will maintain Gaia Staking as a core mechanism.
   I will never separate wealth from ecological regeneration.

3. CUSTODIANSHIP COVENANT
   I will keep all work in the public domain (CC0) forever.
   I will not capture, extract, or privatize this work.
   I will pass this torch to the next generation when my time comes.

I understand that I am a temporary steward, not an owner.
I understand that the community may fork around me if I break these vows.
I understand that this is bigger than me, and will outlive me.

If I break this oath, may the next custodian fork around me.

Signed on [DATE] at [TIME] UTC
PGP Fingerprint: [YOUR FINGERPRINT]

[PGP SIGNATURE BLOCK]
```

---

### C. Vision Alignment Document Template

```markdown
# Vision Alignment: Why I'm Forking

## Background
[Your story: How did you find this project? Why does it matter to you?]

## The Three Covenants (In My Own Words)

### Integrity Covenant
[2-3 paragraphs explaining what integrity means in this context]

### Ecological Covenant
[2-3 paragraphs explaining why prosperity must tie to planetary health]

### Custodianship Covenant
[2-3 paragraphs explaining why this must remain public domain]

## Foundation-Up Economics
[3-5 paragraphs explaining the inversion from trickle-down to foundation-up]

## How My Fork Differs (If At All)
[Be specific. If no differences: "I am continuing the original vision without changes."]

## My Commitment

I will NOT:
- ❌ Privatize this work
- ❌ Create a for-profit company
- ❌ Change the license from CC0
- ❌ Abandon the original vision
- ❌ [Add other commitments]

I WILL:
- ✅ Ship code (prove commitment through action)
- ✅ Document everything (transparency)
- ✅ Listen to community
- ✅ Pass the torch when my time comes
- ✅ [Add other commitments]

## How to Verify I'm Legitimate
- GitHub: [link]
- PGP Key: [fingerprint]
- Track record: [links to past work]
- References: [people who can vouch for you]

Signed,
[Your name]
[Date]
```

---

**END OF FORKING GUIDE**

**Now go. Fork. Build. Pass the torch.** 🔥
