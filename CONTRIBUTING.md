# Contributing to Mobius-Substrate

Thank you for your interest in contributing to **Mobius-Substrate**.

This document defines the default contributor workflow for the monorepo.

## Repository structure

Mobius-Substrate is a monorepo containing applications, services, shared packages, labs, sentinels, and governance surfaces.

```
Mobius-Substrate/
├── apps/        # Deployable applications
├── services/    # Backend services and APIs
├── packages/    # Shared libraries and SDKs
├── sentinels/   # AI governance agents
├── labs/        # Experimental proof systems
├── docs/        # Documentation
├── specs/       # Protocol specifications
├── scripts/     # Utility and automation scripts
├── tests/       # Test suites
└── infra/       # Infrastructure and deployment configs
```

For a guided overview, start with `docs/START_HERE.md`.

## Getting started

### Prerequisites

- **Node.js** 18+
- **npm** 8+
- **Docker** and Docker Compose (for local services)
- **Git**
- **Python** 3.11+ (for certain services)

### Initial setup

```bash
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate
npm install
npm run build
npm run test
```

## Development workflow

### Branch strategy

- `main` -- protected production branch; requires approvals and green CI
- `develop` -- optional integration branch for staging larger drops
- `sentinel/<name>/main` -- long-lived Sentinel lanes (e.g. `sentinel/jade/main`)
- `feat/<scope>/<slug>` -- short-lived feature branches
- `fix/<scope>/<slug>` -- short-lived bugfix branches
- `docs/<slug>` -- documentation-only branches
- `chore/<slug>` -- tooling, infra, or maintenance branches
- `cursor/<slug>` -- background agent work; must merge into the owning lane first when applicable

### Branch name examples

```
feat/ledger/gi-threshold-validation
fix/hub/memory-parser-leak
docs/start-here-index
chore/workflow-consolidation
sentinel/jade/main
```

### Creating a branch

```bash
git checkout main
git pull origin main
git checkout -b feat/<scope>/<slug>
```

## Integrity gates

All contributions should preserve or improve repository integrity.

Before requesting review, run:

```bash
npm run lint
npm run type-check
npm run build
npm run test --workspaces --if-present
npm run integrity:check
```

### Additional expectations

- Destructive changes (file deletions, large refactors) require maintainer review and must pass the anti-nuke workflow
- Large refactors require explicit justification
- Anti-nuke failures block merge until remediated
- Changes that reduce MII below `0.95` are not mergeable without explicit approval
- Governance-sensitive changes should align with the owning surface in `CODEOWNERS`

## Commit message convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Types

- `feat` -- new feature
- `fix` -- bug fix
- `docs` -- documentation changes
- `refactor` -- code refactoring without feature or fix changes
- `perf` -- performance improvements
- `test` -- adding or updating tests
- `chore` -- build process, tooling, dependencies

### Examples

```bash
feat(ledger): add GI threshold validation
fix(hub-web): resolve parser memory leak
docs(start-here): add newcomer architecture index
chore(ci): consolidate workflow gates
```

## Testing

### Run all tests

```bash
npm run test
```

### Run a specific workspace

```bash
npm run test --workspace=packages/integrity-core
```

### Coverage

```bash
npm run test -- --coverage
```

### Writing tests

- Place tests next to source files or in `__tests__/` directories
- Name test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `test_*.py`
- Aim for >70% code coverage for new features

## Code style

### TypeScript / JavaScript

- Use **TypeScript** for all new code
- Follow existing code style and lint rules
- Run `npm run lint` before committing

### Python

- Follow **PEP 8**
- Use **type hints** where possible
- Format with **Black** (if available)

### Formatting

- **Indentation:** 2 spaces for TS/JS, 4 spaces for Python
- **Line length:** 80-100 characters preferred
- **Quotes:** single quotes for JS/TS, double quotes for Python

## Working with the monorepo

### Adding a new package

1. Create package directory under `packages/`
2. Initialize `package.json` with the `@kaizen/` scope
3. The root workspace picks it up automatically

### Adding a new app

Similar to packages, but under `apps/`. Initialize with the appropriate framework (Next.js, Express, FastAPI, etc.).

### Using Turbo tasks

Turborepo caches builds and runs tasks in parallel:

```bash
npm run build     # Build only changed packages
npm run dev       # Run dev servers for all apps
npm run lint      # Lint affected files
```

## Extending the Mobius Universal Orchestrator

New **engines** or **channels** must respect the constitutional pipeline:

```
User -> Thought Broker -> Engines -> Sentinels -> GI Gate -> Ledger -> Channels
```

### Adding a new engine

1. Produce the shared engine schema (engine name, answer, metadata with tokens, latency, tools used, risk flags)
2. Update Thought Broker routing logic
3. Confirm Sentinel consensus ingests the new engine
4. Document credentials and env vars in `infra/dva/flows/`

### Adding a new channel

1. Add a node after Civic Ledger attestation
2. Enforce GI thresholds before side effects (`gi >= 0.95` for standard, `>= 0.98` for high-risk)
3. Require human-in-loop confirmation for irreversible actions (deploy, finance, governance)

### Non-negotiables

- Engines are tools, not governors
- Sentinel consensus and the GI gate remain the decision authority
- All significant actions must be Civic-Ledger attested or escalated to human review

## Security

### Reporting vulnerabilities

**Do not** create public issues for security vulnerabilities. Instead, email the security contact (see `SECURITY.md`), include detailed description and reproduction steps, and wait for acknowledgment before public disclosure.

### Secrets management

- **Never** commit secrets, API keys, or credentials
- Use `.env.local` for local secrets (gitignored)
- Use environment variables for production
- Reference secrets via `process.env.VARIABLE_NAME`

## Pull request process

### Before submitting

1. Code compiles without errors
2. Tests pass locally
3. Linter passes without errors
4. Documentation updated if needed
5. Commits follow convention
6. Branch is up-to-date with main
7. `spec-ci` workflow passes for any schema or OpenAPI change

### PR checklist

- [ ] Title follows conventional commit format
- [ ] Description explains what and why
- [ ] Tests added for new features
- [ ] Breaking changes clearly documented
- [ ] Screenshots included for UI changes
- [ ] Links to related issues or PRs
- [ ] `spec-ci` green when touching `docs/06-specifications/schemas/**` or `apps/**/openapi.yaml`

When relevant, include an EPICON intent block in the PR description.

### Review process

1. Automated checks run via GitHub Actions
2. Code review by the relevant Sentinel team or maintainer
3. Integrity checks verify MII >= 0.95
4. Merge when approvals recorded and all required checks pass

## Governance

Mobius-Substrate is maintained by:

- **Custodian:** Michael Judan
- **Sentinels:** Zeus, Jade, Eve, Hermes, Atlas, Aurelian
- **Contributors:** community members

For governance questions, see `docs/03-GOVERNANCE-AND-POLICY/`.

## License

By contributing to Mobius-Substrate, you agree that your contributions will be licensed under AGPL-3.0 with Ethical Addendum. See `LICENSE` and `ETHICAL_ADDENDUM.md`.

---

## Authority Provenance

This document is maintained under founder standing as a policy document for the Mobius-Substrate monorepo. Changes to this file are governed by the Authority Provenance Guard workflow.

Authority declared using EPICON_FOUNDER_STANDING.md

---

**Mobius-Substrate** -- Integrity infrastructure, built slowly, built with memory.

*"We heal as we walk."*
