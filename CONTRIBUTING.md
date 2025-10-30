# Contributing to Kaizen OS

Thank you for your interest in contributing to Kaizen OS! This document provides guidelines and instructions for contributing to this monorepo.

## 🏗️ Repository Structure

Kaizen OS is a monorepo containing multiple applications, packages, labs, and AI sentinels:

```
kaizen-os/
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
   git clone https://github.com/kaizencycle/kaizen-os.git
   cd kaizen-os
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

- **`main`** - Production-ready code, protected branch
- **`develop`** - Integration branch for features (if used)
- **`feature/*`** - Feature branches (e.g., `feature/add-telemetry-dashboard`)
- **`fix/*`** - Bug fix branches (e.g., `fix/memory-leak-in-ledger`)
- **`docs/*`** - Documentation updates
- **`cursor/*`** - Background agent work branches

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

### PR Checklist

When creating a PR, ensure:

- [ ] **Title** follows conventional commit format
- [ ] **Description** explains what and why
- [ ] **Tests** added for new features
- [ ] **Breaking changes** clearly documented
- [ ] **Screenshots** included for UI changes
- [ ] **Links** to related issues/PRs

### Review Process

1. **Automated checks** run via GitHub Actions
2. **Code review** by maintainer or contributor
3. **Integrity checks** verify GI ≥ 0.95
4. **Merge** when approved and checks pass

### PR Template

```markdown
## Summary
Brief description of changes

## Changes
- Added feature X
- Fixed bug Y
- Updated documentation Z

## Testing
How to test these changes

## Breaking Changes
List any breaking changes or migration needed

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
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

Kaizen OS is maintained by:
- **Custodian:** Michael Judan
- **Sentinels:** Zeus, Jade, Eve, Hermes, Atlas, Aurelian
- **Contributors:** Community members like you!

For governance questions, see `docs/governance/`

## 📜 License

By contributing to Kaizen OS, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Your contributions make Kaizen OS better for everyone. We appreciate your time and effort!

---

**Kaizen OS** - Continuous improvement through integrity, consensus, and collaboration.

*"We heal as we walk."*
