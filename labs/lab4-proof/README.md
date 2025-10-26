# Lab4-Proof 🚀

A secure, open-source ledger system combining **FastAPI backend** with **Next.js frontend** for reflection tracking and GIC rewards.

[![Security](https://img.shields.io/badge/Security-Public%20Safe-green.svg)](SECURITY.md)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)

## ✨ Features

- 🔐 **Secure Ledger System** - Immutable daily records with Merkle tree integrity
- 🤖 **AI-Powered Reflections** - Intelligent companion system for personal growth
- 💰 **GIC Rewards** - Gamified incentive system for engagement
- 🔄 **Auto-Merge Workflows** - Automated PR management and deployment
- 🛡️ **Public-Safe** - No hardcoded secrets, environment-based configuration
- 📊 **Admin Dashboard** - Real-time monitoring and analytics

## 📂 Project Structure

```
lab4-proof/
├── app/                    # FastAPI backend
│   ├── main.py            # Main application
│   ├── models.py          # Pydantic models
│   ├── storage.py         # Data storage utilities
│   ├── hashing.py         # Cryptographic functions
│   └── routers/           # API route modules
├── reflections/           # Next.js frontend
├── .github/workflows/     # GitHub Actions automation
├── data/                  # Ledger data (gitignored)
├── tests/                 # Test suite
└── scripts/               # Utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/lab4-proof.git
cd lab4-proof
```

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.template .env
# Edit .env with your configuration

# Run development server
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Install dependencies
cd reflections
npm install

# Run development server
npm run dev
```

### 4. Access Application
- **API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

Copy `env.template` to `.env` and configure:

```bash
# Required
ADMIN_TOKEN=your_secure_admin_token
ADMIN_KEY=your_secure_admin_key
LEDGER_HMAC_KEY=your_secure_hmac_key

# Optional
DEMO_MODE=false
OPENAI_API_KEY=your_openai_key
```

### Security Configuration

- ✅ All secrets use environment variables
- ✅ No hardcoded credentials
- ✅ CORS protection enabled
- ✅ Admin endpoints protected
- ✅ Data sanitization implemented

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/seed` | POST | Create daily seed |
| `/sweep` | POST | Add reflection sweep |
| `/seal` | POST | Seal daily ledger |
| `/verify/{date}` | GET | Verify ledger integrity |
| `/export/{date}` | GET | Export daily data |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/metrics` | GET | System metrics |
| `/admin/agents` | GET | Agent status |
| `/bonus/run` | POST | Run bonus calculations |

## 🛡️ Security

This repository is **public-safe** with:
- No hardcoded secrets or API keys
- Comprehensive `.gitignore` for sensitive files
- Environment-based configuration
- Security audit checklist in `SECURITY.md`

See [SECURITY.md](SECURITY.md) for detailed security information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest`
5. Submit a pull request

## 📄 License

This project is open source. See LICENSE file for details.

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/yourusername/lab4-proof/issues)
- 💬 [Discussions](https://github.com/yourusername/lab4-proof/discussions)

---

**Made with ❤️ for the HIVE ecosystem**

