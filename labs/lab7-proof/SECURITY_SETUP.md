# Security Setup Guide

## 🔒 Setting Up Real Configuration Values

**IMPORTANT**: Never commit real keys to version control. This guide shows you how to set up your local environment securely.

## 1. Create Your Local `.env` File

Copy `env.example` to `.env` and fill in your real values:

```bash
cp env.example .env
```

## 2. Fill in Real Values in `.env`

Replace all placeholder values with your actual configuration:

```bash
# Example of what to replace in .env
OAA_ED25519_PUBLIC_B64=your_actual_public_key_here
OAA_ED25519_PRIVATE_B64=your_actual_private_key_here
API_KEY=your_actual_api_key_here
LAB7_BACKEND_SERVICE_ID=your_actual_service_id_here
# ... etc
```

## 3. Verify `.env` is Gitignored

Check that `.env` is in your `.gitignore`:

```bash
grep -n "\.env" .gitignore
```

Should show:
```
51:.env
52:.env.*
53:!env.example
```

## 4. Test Your Configuration

Run your application to verify environment variables are loaded:

```bash
# Test that environment variables are loaded
python -c "import os; print('API_KEY loaded:', bool(os.getenv('API_KEY')))"
```

## 5. GitHub Secrets Setup

For CI/CD, add these as GitHub repository secrets:

- `LAB7_RENDER_API_KEY`
- `LAB7_BACKEND_SERVICE_ID` 
- `LAB7_FRONTEND_SERVICE_ID`
- `LAB7_AUTOLABEL_TOKEN` (GitHub Personal Access Token)

## 6. GitHub Variables Setup

Add these as GitHub repository variables:

- `LAB7_BACKEND_HEALTH_URL`
- `LAB7_FRONTEND_HEALTH_URL`

## ✅ Security Checklist

- [ ] `.env` file created with real values
- [ ] `.env` file is gitignored (never committed)
- [ ] `env.example` contains only placeholders
- [ ] No real secrets in any public files
- [ ] GitHub secrets configured for CI/CD
- [ ] GitHub variables configured for health checks
- [ ] Local development works with `.env` file

## 🚨 Security Warnings

- ❌ **NEVER** commit `.env` files
- ❌ **NEVER** put real values in `env.example`
- ❌ **NEVER** hardcode secrets in code files
- ✅ **ALWAYS** use environment variables
- ✅ **ALWAYS** use GitHub secrets for CI/CD
- ✅ **ALWAYS** verify `.gitignore` includes `.env`

## 🔧 Troubleshooting

### Environment Variables Not Loading
```bash
# Check if .env exists
ls -la .env

# Check if values are set
echo $API_KEY
```

### Git Trying to Commit .env
```bash
# Remove from staging if accidentally added
git reset HEAD .env

# Verify it's gitignored
git check-ignore .env
```

### GitHub Actions Not Finding Secrets
- Verify secrets are set in repository settings
- Check secret names match exactly
- Ensure secrets are not variables (they're different)

