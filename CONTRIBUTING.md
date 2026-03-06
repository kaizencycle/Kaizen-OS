# Contributing to Mobius Substrate

Thank you for your interest in contributing to Mobius Substrate (formerly Mobius Systems)! This document provides guidelines and instructions for contributing to this monorepo.

## 🏗️ Repository Structure

Mobius Substrate is a monorepo containing multiple applications, packages, labs, and AI sentinels:

```
Mobius-Substrate/
├── apps/          # Standalone applications
├── packages/      # Shared libraries and SDKs
├── labs/          # Lab proof systems (research & validation)
├── sentinels/     # AI sentinel agents
├── docs/          # Documentation
├── scripts/       # Utility scripts
└── tests/         # Test suites
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **Docker** & Docker Compose (for local services)
- **Git**
- **Python** 3.11+ (for certain services)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kaizencycle/Mobius-Substrate.git
   cd Mobius-Substrate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build all packages:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm run test
   ```

## 🔧 Development Workflow

### Branch Strategy

- **`main`** – Production releases (protected; requires approvals + green CI).
- **`develop`** – Optional integration branch for staging larger drops.
- **`sentinel/<name>/main`** – Long-lived lanes for each Sentinel (e.g., `sentinel/jade/main`).
- **`feat/<sentinel>/<topic>`** – Short-lived feature branches targeting the owning Sentinel lane.
- **`fix/<sentinel>/<issue>`** – Hotfix branches for urgent remediation.
- **`docs/<topic>`** – Documentation-only changes.
- **`cursor/*`** – Background agent work (must target owning Sentinel lane on merge).

### Creating a Feature Branch

```bash
# From main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit, and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### Additive-Only & Integrity Gates

- All contributions should be additive; destructive changes (file deletions, large refactors) require maintainer + Zeus approval and must pass the anti-nuke workflow.
- Run `npm run lint`, `npm run type-check`, `npm run build`, `npm run test --workspaces --if-present`, and `node scripts/mii/compute.js --threshold 0.95` before requesting review.
- PRs that trigger the anti-nuke guard or drop MII below 0.95 are auto-blocked until remediated.
- Align with the Sentinel owning the surface (see CODEOWNERS) and obtain sign-off when required.

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature/fix changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples:**
```bash
feat(ledger-api): add GI threshold validation
fix(hub-web): resolve memory leak in OAA parser
docs(readme): update installation instructions
chore(deps): upgrade turbo to v1.11
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=packages/integrity-core

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests

- Place tests next to source files or in `__tests__/` directories
- Name test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `test_*.py`
- Aim for >70% code coverage for new features

## 🎨 Code Style

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow existing code style
- Run linter before committing:
  ```bash
  npm run lint
  ```

### Python

- Follow **PEP 8** style guide
- Use **type hints** where possible
- Format with **Black** (if available)

### Formatting

- **Indentation:** 2 spaces for TS/JS, 4 spaces for Python
- **Line length:** 80-100 characters preferred
- **Quotes:** Single quotes for JS/TS, double quotes for Python

## 📦 Working with the Monorepo

### Adding a New Package

1. Create package directory:
   ```bash
   mkdir -p packages/your-package-name
   cd packages/your-package-name
   ```

2. Initialize package.json:
   ```json
   {
     "name": "@kaizen/your-package-name",
     "version": "0.1.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "test": "jest",
       "lint": "eslint src"
     }
   }
   ```

3. Add to root workspace (automatic if in `packages/` directory)

### Adding a New App

Similar to packages, but apps are standalone deployable services:

```bash
mkdir -p apps/your-app-name
cd apps/your-app-name
# Initialize with appropriate framework (Next.js, Express, FastAPI, etc.)
```

### Using Turbo Tasks

Turborepo caches builds and runs tasks in parallel:

```bash
# Build only changed packages
npm run build

# Run dev servers for all apps
npm run dev

# Lint only affected files
npm run lint
```

## Extending the Mobius Universal Orchestrator

You can add new **engines** or **channels** to the orchestrator, but they MUST respect the constitutional pipeline:

`User → Thought Broker → Engines → Sentinels → GI Gate → Ledger → Channels`

### Adding a new engine

1. Add a node (or service) that produces the shared engine schema:

```json
{
  "engine": "your-engine-name",
  "answer": "string",
  "metadata": {
    "tokens": 0,
    "latency_ms": 0,
    "tools_used": [],
    "risk_flags": []
  }
}
```

2. Update the Thought Broker routing logic so the new engine is used for appropriate tasks.
3. Confirm Sentinel consensus ingests the new engine under `engines.<name>`.
4. Document credentials/env vars in `infra/dva/flows/**`.

### Adding a new channel

1. Add a node after Civic Ledger attestation.
2. Enforce GI thresholds before side effects (`gi >= 0.95` for standard, `>= 0.98` for high-risk).
3. Require human-in-loop confirmation for irreversible actions (deploy, finance, governance).

### Non‑negotiables

- Engines are tools, not governors.
- Sentinel consensus + GI gate stay the decision authority.
- All significant actions must be Civic-Ledger attested or escalated to human review.

## 🔐 Security

### Reporting Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security contact (see SECURITY.md)
2. Include detailed description and reproduction steps
3. Wait for acknowledgment before public disclosure

### Secrets Management

- **NEVER** commit secrets, API keys, or credentials
- Use `.env.local` for local secrets (gitignored)
- Use environment variables for production
- Reference secrets via `process.env.VARIABLE_NAME`

## 📝 Documentation

### Updating Documentation

- Keep README.md up to date with changes
- Update relevant docs in `docs/` directory
- Add inline code comments for complex logic
- Update CHANGELOG.md for significant changes

### Documentation Structure

```
docs/
├── START_HERE.md           # New user entry point
├── architecture/           # System architecture docs
├── onboarding/            # Onboarding guides
├── deployment/            # Deployment guides
└── companions/            # AI companion documentation
```

## 🔍 Pull Request Process

### Before Submitting

1. ✅ **Code compiles** without errors
2. ✅ **Tests pass** locally
3. ✅ **Linter passes** without errors
4. ✅ **Documentation updated** if needed
5. ✅ **Commits follow** convention
6. ✅ **Branch is up-to-date** with main
7. ✅ **spec-ci workflow passes** for any schema or OpenAPI change

### PR Checklist

When creating a PR, ensure:

- [ ] **Title** follows conventional commit format
- [ ] **Description** explains what and why
- [ ] **Tests** added for new features
- [ ] **Breaking changes** clearly documented
- [ ] **Screenshots** included for UI changes
- [ ] **Links** to related issues/PRs
- [ ] **spec-ci** status is green when touching `docs/06-specifications/schemas/**` or `apps/**/openapi.yaml`

### Review Process

1. **Automated checks** run via GitHub Actions
2. **Code review** by the relevant Sentinel team or maintainer
3. **Integrity checks** verify MII ≥ 0.95
4. **Merge** when approvals recorded and all required checks pass

### PR Template

```markdown
### Summary
- What changed & why

### Integrity Checklist
- [ ] MII local check ≥ 0.95
- [ ] Additive-only (no destructive changes)
- [ ] Affected services listed with risks

### Evidence
- Logs / screenshots / test output

### Linked Issues
Closes #

### Sentinel Sign-off
- [ ] AUREA  - logic
- [ ] EVE    - ethics/policy
- [ ] HERMES - ops
- [ ] JADE   - morale/user exp
- [ ] ZEUS   - arbiter (required)
```

## 🤝 Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Be open to suggestions
- Update PR based on feedback

### For Reviewers

- Be respectful and constructive
- Review code, not the person
- Suggest improvements clearly
- Approve when standards are met

## 🎯 Contribution Areas

### Where to Contribute

- **🐛 Bug fixes** - Check issues labeled `bug`
- **✨ Features** - Check issues labeled `enhancement`
- **📝 Documentation** - Improve clarity, fix typos, add examples
- **🧪 Tests** - Increase test coverage
- **♿ Accessibility** - Improve UI accessibility
- **🌐 Internationalization** - Add translations
- **⚡ Performance** - Optimize slow operations

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

## 📞 Getting Help

- **Questions?** Open a discussion on GitHub
- **Found a bug?** Open an issue
- **Need real-time help?** Check project communication channels

## 🏛️ Governance

Mobius Substrate is maintained by:
- **Custodian:** Michael Judan
- **Sentinels:** Zeus, Jade, Eve, Hermes, Atlas, Aurelian
- **Contributors:** Community members like you!

For governance questions, see `docs/02-governance/`

## 📜 License

By contributing to Mobius Substrate, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Your contributions make Mobius Substrate better for everyone. We appreciate your time and effort!

---

**Mobius Substrate** - Continuous improvement through integrity, consensus, and collaboration.

*"We heal as we walk."*
