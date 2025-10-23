# 🛡️ Lab7-Proof Universal Security Guide

## Overview

This guide provides comprehensive security practices for the Lab7-Proof ecosystem, protecting against token leaks, API key exposure, and accidental state uploads across all connected modules.

## 🔐 Security Architecture

### Environment Variable Hierarchy
1. **`env.template`** → Universal template (committed)
2. **`*.env.example`** → Module-specific examples (committed)  
3. **`.env`** → Local development (gitignored)
4. **GitHub Secrets** → Production deployment
5. **Render Environment** → Runtime configuration

### File Protection Strategy
- ✅ **Committed**: Templates and examples only
- ❌ **Never Committed**: Real keys, tokens, certificates
- 🔒 **Gitignored**: All `.env`, `*.key`, `*.pem`, state files

## 📁 Universal .gitignore

Our `.gitignore` protects against:

### Core Secrets
- `.env` files (except examples)
- Private keys (`*.pem`, `*.key`, `*.crt`)
- Certificates and tokens
- State files (`*_state.json`)

### Build Artifacts
- Python cache (`__pycache__/`)
- Node modules (`node_modules/`)
- Build outputs (`dist/`, `build/`, `out/`)

### Development Files
- IDE configurations (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs and debug files

## ⚙️ Environment Template System

### Universal Template (`env.template`)
Use this as the base for all modules:

```bash
# Copy to module-specific examples
cp env.template lab7.env.example
cp env.template citizen_shield.env.example
cp env.template reflections.env.example
```

### Module-Specific Examples
Each module should have its own `.env.example`:
- `lab7.env.example` - OAA configuration
- `citizen_shield.env.example` - Security module config
- `reflections.env.example` - Learning platform config

## 🚀 Deployment Security

### GitHub Actions Secrets
Store sensitive values in GitHub repository secrets:
- `RENDER_API_KEY`
- `LEDGER_TOKEN`
- `OAA_ED25519_PRIVATE_B64`
- `CITIZEN_SHIELD_API_KEY`

### Render Environment Variables
Configure production values in Render dashboard:
- Use GitHub Secrets integration
- Never hardcode in deployment files
- Rotate keys regularly

## 🔄 Key Rotation Process

### 1. Generate New Keys
```bash
# Generate new Ed25519 key pair
python -c "from nacl import signing; import base64; sk = signing.SigningKey.generate(); print('OAA_ED25519_PRIVATE_B64=' + base64.b64encode(sk.encode()).decode()); print('OAA_ED25519_PUBLIC_B64=' + base64.b64encode(sk.verify_key.encode()).decode())"
```

### 2. Update Secrets
- Update GitHub repository secrets
- Update Render environment variables
- Update local `.env` files

### 3. Deploy
- Deploy with new keys
- Verify functionality
- Remove old keys from all locations

## 🛠️ Development Workflow

### Local Development
1. Copy `env.template` to `.env`
2. Fill in real values for local testing
3. Never commit `.env` files

### Team Onboarding
1. Share `*.env.example` files
2. Provide setup instructions
3. Use GitHub Secrets for CI/CD

### Production Deployment
1. Configure GitHub Secrets
2. Use Render environment variables
3. Monitor for exposed secrets

## 🔍 Security Checklist

### Before Committing
- [ ] No `.env` files in staging
- [ ] No real keys in committed files
- [ ] All templates use placeholders
- [ ] `.gitignore` is comprehensive

### Before Deploying
- [ ] GitHub Secrets configured
- [ ] Render environment variables set
- [ ] All placeholders replaced
- [ ] Security scan passed

### Regular Maintenance
- [ ] Rotate keys quarterly
- [ ] Audit secret access
- [ ] Update security dependencies
- [ ] Review access logs

## 🚨 Incident Response

### If Secrets Are Exposed
1. **Immediately** rotate all exposed keys
2. Revoke access tokens
3. Update all environments
4. Audit access logs
5. Review commit history

### Prevention
- Use pre-commit hooks
- Regular security scans
- Team training on secret management
- Automated secret detection

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [OWASP Secret Management](https://owasp.org/www-project-cheat-sheets/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask before committing sensitive information.
