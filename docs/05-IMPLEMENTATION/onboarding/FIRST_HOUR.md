# Your First Hour in Mobius

Welcome to civic engineering.

This guide gets you from zero to your first contribution in under 60 minutes.

---

## Minute 0-5: Understand What You're Joining

Mobius is not a typical open source project. It's **civic infrastructure for AI accountability**.

Before writing code, understand these principles:

1. **Integrity over speed** — We'd rather ship slowly and correctly
2. **Intent before action** — Explain why, not just what
3. **Memory is permanent** — Your contributions become part of an auditable history
4. **Humans remain in control** — AI assists, humans decide

---

## Minute 5-15: Set Up Your Environment

### Option A: Devcontainer (Recommended)

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate

# Open in VS Code with devcontainer
code .
# Then: Ctrl+Shift+P → "Reopen in Container"
```

### Option B: Local Setup

```bash
# Prerequisites
node --version  # Must be 20+
npm --version   # Must be 8+

# Clone and install
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate
npm install
```

---

## Minute 15-25: Verify Everything Works

Run the verification suite:

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Check linting
npm run lint

# Type check
npm run type-check
```

All commands should pass. If something fails:
1. Check Node version (must be 20+)
2. Delete `node_modules` and reinstall
3. Check `.github/CI_FAILURES_FIXED.md` for known issues

---

## Minute 25-35: Read the Essential Docs

Read these in order (15 minutes total):

1. **[GOVERNANCE.md](/docs/GOVERNANCE.md)** (5 min)
   - How decisions are made
   - Who has authority
   - How to propose changes

2. **[CONTRIBUTOR_CLASSES.md](/docs/03-GOVERNANCE-AND-POLICY/contributors/CONTRIBUTOR_CLASSES.md)** (5 min)
   - Your role as H1 Contributor
   - What you can and cannot do
   - How to advance

3. **[ZEUS_POLICY.md](/docs/03-GOVERNANCE-AND-POLICY/governance/ZEUS_POLICY.md)** (5 min)
   - Risk tiers
   - What triggers review
   - How to avoid blocks

---

## Minute 35-45: Find Your First Issue

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

### Recommended Starting Points

1. **Documentation fixes** — Typos, unclear explanations, broken links
2. **Test additions** — Increase coverage for existing code
3. **Small bug fixes** — Issues with clear reproduction steps

### Avoid Starting With

- Security-related code
- Ledger or MIC changes
- Authentication/authorization
- Production infrastructure

---

## Minute 45-55: Make Your First Change

### 1. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b fix/your-descriptive-name
```

### 2. Make Your Change

Keep it small and focused. One issue, one PR.

### 3. Test Locally

```bash
npm run test
npm run lint
npm run type-check
```

### 4. Commit with Convention

```bash
git add .
git commit -m "fix(docs): correct installation instructions"
```

Commit types:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `test:` — Test additions
- `chore:` — Maintenance

### 5. Push and Create PR

```bash
git push -u origin fix/your-descriptive-name
```

Then open a PR using the template.

---

## Minute 55-60: Submit and Wait

### PR Checklist

Before submitting, verify:

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Commit message follows convention
- [ ] PR description explains what and why
- [ ] Linked to issue (if applicable)

### What Happens Next

1. **Automated checks** run (5-10 minutes)
2. **Co-reviewer** (AI) provides initial feedback
3. **Maintainer** reviews within 72 hours
4. **Merge** once approved

### While You Wait

- Read more documentation
- Explore the codebase
- Find your next issue
- Join discussions

---

## Quick Reference Card

### Commands You'll Use

```bash
npm install          # Install dependencies
npm run build        # Build all packages
npm run test         # Run tests
npm run lint         # Check code style
npm run type-check   # TypeScript validation
```

### Files You Should Know

```
CONTRIBUTING.md      # Contribution guidelines
docs/GOVERNANCE.md   # Decision-making process
.github/CODEOWNERS   # Who reviews what
package.json         # Project configuration
```

### Risk Levels

| Tier | Description | Review Required |
|------|-------------|-----------------|
| 0 | Docs/comments | 1 reviewer |
| 1 | App code | 1 maintainer |
| 2 | Auth/ledger | 2 approvals |
| 3 | MIC/production | Steward + token |

---

## Getting Help

- **Stuck on setup?** Check `.github/WORKFLOW_ISSUES_REPORT.md`
- **Question about process?** Open a discussion
- **Found a bug?** Open an issue
- **Security concern?** Email security@mobius.systems

---

## The Civic Promise

By contributing to Mobius, you're not just writing code. You're building infrastructure that helps societies hold AI systems accountable.

Every line you write becomes part of a permanent, auditable record. Make it count.

---

*Welcome to Mobius. We heal as we walk.*
