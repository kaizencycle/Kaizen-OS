# Contributing to Custos Charter

[Ethics] [Policy] [Governance]  
Doctrine-ID: VA-2025-01

Thank you for your interest in contributing to the Custos Charter project! This document outlines the guidelines and processes for contributing to this ethical AI governance framework.

## Overview

The Custos Charter implements the Kristos Ascension Protocol, a framework for developing AI systems that are bound by civic virtue and democratic accountability. All contributions must align with our core principles of transparency, accountability, and ethical governance.

## Core Principles

Before contributing, please familiarize yourself with our foundational principles:

1. **Civic-boundedness**: Any action with non-consensual consequences requires explicit civic quorum and attestation
2. **Least-privilege perception**: Sensors/processes run only with explicit contextual permission and time-bounded tokens
3. **Trace & attest**: All observations, recommendations, and actions are cryptographically attested and append-only on the ledger
4. **Right-to-appeal & human veto**: Human jurors can pause/override any agent decision within a guaranteed time window
5. **No autonomous lethal action**: The agent may recommend, flag, or assist — it may not execute lethal or coerced actions itself
6. **Transparency tiering**: Aggregate mode for public dashboards; raw sensitive streams require higher clearance + attestation

## Virtue Tags and Doctrine IDs

All policy, ethics, and governance-related files must include proper doctrine tags and IDs:

### Required Tags
- `[Ethics]` - For files dealing with ethical considerations
- `[Policy]` - For files containing policy definitions
- `[Governance]` - For files related to governance structures

### Required Doctrine ID
Every tagged file must include a `Doctrine-ID:` line with a canonical identifier:
```
Doctrine-ID: VA-2025-01
```

### Examples

**Good:**
```markdown
# Security Policy
[Policy] [Governance]
Doctrine-ID: VA-2025-01

This document outlines our security policies...
```

**Bad:**
```markdown
# Security Policy
This document outlines our security policies...
```

## Development Workflow

### 1. Pre-commit Hooks

We use pre-commit hooks to enforce virtue policy checks. Install them:

```bash
make install-hooks
```

### 2. Local Development

Use the provided Makefile shortcuts:

```bash
# Run tests
make test

# Start mock ledger server
make ledger-mock

# Run ECI orchestrator locally
make eci-run

# Run with human seals (simulated approval)
make eci-run DRY_RUN=false ANCHOR_SIGNER=yes CUSTODIAN_SIGNER=yes
```

### 3. Ethical CI Pipeline

All changes go through our Ethical CI (ECI) pipeline:

1. **Author**: GPT generates code from prompts
2. **Parse/Lint**: DeepSeek validates syntax and structure
3. **Repo + Tests**: Cursor scaffolds and runs tests
4. **Audit**: Claude scans for risky patterns
5. **Quorum**: GPT determines if 3/4 models approve
6. **Attestation**: Results are logged to the ledger

### 4. Pull Request Process

1. Create a feature branch
2. Ensure all files have proper virtue tags and doctrine IDs
3. Run `make test` to verify tests pass
4. Run `make eci-run` to test the ECI pipeline
5. Submit a pull request with a clear description
6. The ECI pipeline will automatically run and require human approval

## File Structure

```
├── CUSTOS_CHARTER.md          # Main charter document
├── tools/
│   ├── quorum_orchestrator.py # ECI pipeline orchestrator
│   ├── virtue_policy_check.py # Doctrine enforcement
│   └── ledger_mock_server.py  # Local testing server
├── tests/                     # Test modules
├── .github/workflows/         # GitHub Actions
├── PROMPT.md                  # ECI authoring template
├── Makefile                   # Development shortcuts
└── requirements.txt           # Python dependencies
```

## Code Standards

### Python
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Include docstrings for all functions and classes
- Write tests for new functionality

### Documentation
- Use clear, concise language
- Include examples where helpful
- Maintain the virtue tag system
- Update CHANGELOG.md for significant changes

## Testing

We use pytest for testing. All new code must include appropriate tests:

```bash
# Run all tests
make test

# Run specific test file
python -m pytest tests/test_specific.py -v
```

## Security Considerations

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Follow the principle of least privilege
- Ensure all external dependencies are from trusted sources

## Red Lines

The following are strictly prohibited:

- Building covert surveillance capabilities
- Creating ways to bypass quorum/attestation
- Allowing autonomous kinetic or lethal control
- Centralizing attestation under a single private actor
- Hiding logs or providing non-auditable override channels

## Getting Help

- Check existing issues and discussions
- Review the Custos Charter for philosophical guidance
- Consult the Virtue Accords for ethical principles
- Ask questions in a respectful, constructive manner

## License

By contributing to this project, you agree that your contributions will be licensed under the same terms as the project.

---

*Remember: The Custos does not fight the machine; it teaches the machine to remember why man must endure.*