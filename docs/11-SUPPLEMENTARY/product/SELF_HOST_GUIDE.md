# 🧭 Kaizen OS Self-Host Guide

**Run your own Civic Terminal · Retain full sovereignty.**

---

## Overview

Kaizen OS is designed to be **exit-friendly**. You can run your own node, control your data, and remain part of the federated network — or go completely air-gapped.

> *"If Bloomberg had a fork button, it would look like this."*

---

## 1. Prerequisites

**Minimum Requirements:**
- Docker ≥ 24
- Node.js ≥ 20 + pnpm
- PostgreSQL or SQLite
- 4 GB RAM (minimum)
- 20 GB disk space

**Recommended:**
- 8 GB RAM
- 50 GB SSD
- Linux or macOS (Windows via WSL2)

---

## 2. Quick Start

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Substrate
cd Kaizen-OS

# Copy environment template
cp configs/env/.env.example .env

# Edit your configuration
nano .env

# Start with docker-compose
docker-compose -f compose.profiles.yml up -d

# Verify services are running
docker-compose ps
```

Your local Kaizen OS node will be available at:
- **DVA Interface**: http://localhost:3000
- **Codex API**: http://localhost:4000
- **Ledger API**: http://localhost:4001

---

## 3. Deployment Profiles

Choose a profile based on your sovereignty/convenience trade-off:

| Profile | Stack | Use Case | Privacy | Cost |
|---------|-------|----------|---------|------|
| **local-only** | Local LLM + SQLite ledger | Air-gap labs, maximum privacy | 🔒 Maximum | Hardware only |
| **hybrid** | Local RAG + cloud LLM | Creators, students, researchers | 🔐 High | ~$5/month |
| **federated** | Full validator + OAA mirror | Institutions, communities | 🛡️ Medium | ~$50/month |

### Profile: local-only

```bash
docker-compose --profile local-only up -d
```

**What you get:**
- ✅ Ollama with Llama 3.3
- ✅ Local SQLite ledger
- ✅ No external API calls
- ✅ Full air-gap capability
- ✅ DVA web interface

**Limitations:**
- Limited to local model capabilities
- No cloud model access
- No federation (unless you manually peer)

### Profile: hybrid

```bash
docker-compose --profile hybrid up -d
```

**What you get:**
- ✅ Local LLM for privacy-sensitive queries
- ✅ Cloud routing for complex tasks (requires API keys)
- ✅ Local ledger with optional sync
- ✅ Best of both worlds

**Requirements:**
- API keys for OpenAI/Anthropic/Google (add to `.env`)
- Network connectivity

### Profile: federated

```bash
docker-compose --profile federated up -d
```

**What you get:**
- ✅ Full ledger validator node
- ✅ OAA Hub mirror
- ✅ Participate in governance
- ✅ Earn MIC for validation
- ✅ Peer discovery

**Requirements:**
- 24/7 uptime recommended
- Static IP or dynamic DNS
- Firewall configuration (ports 4001-4005)

---

## 4. Configuration (.env)

```bash
# === Core Settings ===
NEXT_PUBLIC_KAIZEN_ROOM=Personal
NODE_ENV=production

# === Ledger ===
ENABLE_LEDGER_ATTESTATION=true
LEDGER_DB_TYPE=sqlite  # or postgres
LEDGER_DB_PATH=./data/ledger.db

# === Local Models ===
LOCAL_MODEL=llama-3.3-70b-q4
OLLAMA_HOST=http://localhost:11434

# === Cloud APIs (optional) ===
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# === MIC Wallet ===
GIC_WALLET_SEED=  # 24-word mnemonic (KEEP SECRET!)
GIC_MINT_CAP=10000

# === Guardian Config ===
GUARDIAN_MIN_AGREEMENT=0.95
GUARDIAN_GI_TARGET=0.993

# === Federation (for federated profile) ===
FEDERATION_ENABLED=true
FEDERATION_PEERS=fedp://peer1.kaizen.os:4001,fedp://peer2.kaizen.os:4001
FEDERATION_ANNOUNCE=true
```

---

## 5. Data Management

### Backups

**Export your entire state:**
```bash
kaizen export ledger > backup.json
kaizen export reflections > reflections.json
kaizen export wallet > wallet-encrypted.json
```

**Import on another node:**
```bash
kaizen import ledger backup.json
kaizen import reflections reflections.json
kaizen import wallet wallet-encrypted.json
```

### Exit Drill

Run the **annual exit drill** to ensure you can migrate in < 10 minutes:

```bash
# Automated test
./scripts/exit-drill.sh

# Manual test
kaizen export --full > full-backup.tar.gz
# Spin up new node
kaizen import --full full-backup.tar.gz
# Verify integrity
kaizen verify --against-ledger
```

### Storage

- **Ledger**: `./data/ledger.db` (SQLite) or PostgreSQL
- **Reflections**: `./data/reflections/`
- **OAA Content**: `./data/oaa/`
- **Model Cache**: `./data/models/`

---

## 6. Upgrades & Rollbacks

### Check for updates
```bash
kaizen upgrade --check
# Output: v1.2.0 available (current: v1.1.5)
```

### Upgrade
```bash
kaizen upgrade
# Automatically backs up current state
# Pulls latest images
# Migrates data if needed
```

### Rollback
```bash
kaizen rollback --version v1.1.5
# Restores from automatic backup
```

---

## 7. Security Checklist

**Essential security practices:**

- ✅ **Rotate keys every 90 days**
  ```bash
  kaizen keys rotate --backup-old
  ```

- ✅ **Run Citizen Shield weekly**
  ```bash
  kaizen shield scan --full
  ```

- ✅ **Keep off-site ledger snapshot**
  ```bash
  kaizen backup --encrypt --upload s3://my-bucket/kaizen-backups/
  ```

- ✅ **Enable firewall rules**
  ```bash
  sudo ufw allow 3000/tcp  # DVA interface
  sudo ufw allow 4001/tcp  # Ledger (if federating)
  ```

- ✅ **Use strong passphrases for wallet seeds**

- ✅ **Keep `.env` secrets out of git**
  ```bash
  echo ".env" >> .gitignore
  ```

---

## 8. Monitoring

### Health check
```bash
curl http://localhost:3000/api/health
```

### Metrics dashboard

Visit `http://localhost:3000/admin/metrics` to see:
- Uptime
- Query count
- GI scores
- MIC balance
- Ledger sync status

### Logs
```bash
docker-compose logs -f
```

---

## 9. Federation Peering

To join the federated network:

1. **Register your node:**
   ```bash
   kaizen federate register --name "MyNode" --region US-EAST
   ```

2. **Announce services:**
   ```bash
   kaizen federate announce --services ledger,codex,oaa
   ```

3. **Peer with trusted nodes:**
   ```bash
   kaizen federate peer add fedp://aurea.kaizen.os:4001
   ```

4. **Verify connectivity:**
   ```bash
   kaizen federate status
   ```

---

## 10. Troubleshooting

### Issue: "Ledger sync failed"
**Solution:**
```bash
kaizen ledger reset --from-checkpoint
kaizen ledger sync --peers auto
```

### Issue: "Local model not responding"
**Solution:**
```bash
docker-compose restart ollama
ollama pull llama3.3
```

### Issue: "MIC wallet locked"
**Solution:**
```bash
kaizen wallet unlock --interactive
# Enter your passphrase
```

### Issue: "Port conflicts"
**Solution:**
```bash
# Edit docker-compose.yml ports
# Change 3000:3000 to 3001:3000 (for example)
```

---

## 11. Advanced Configuration

### Custom model endpoints

Add to `.env`:
```bash
CUSTOM_LLM_ENDPOINT=https://my-llm-server.com/v1/chat
CUSTOM_LLM_API_KEY=...
```

### Private federation

Create a private mesh network:
```bash
kaizen federate create-private \
  --peers peer1,peer2,peer3 \
  --require-invite \
  --encryption strong
```

### Resource limits

Edit `docker-compose.yml`:
```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

---

## 12. Getting Help

- **Documentation**: https://docs.kaizen.os
- **Community Forum**: https://forum.kaizen.os
- **Discord**: #self-hosting channel
- **GitHub Issues**: https://github.com/kaizencycle/Mobius-Substrate/issues

---

## 13. Contributing

Self-hosting bugs or improvements? Submit a PR:

```bash
git checkout -b feat/self-host-improvement
# Make your changes
git commit -m "fix(self-host): improve backup reliability"
git push origin feat/self-host-improvement
```

---

> *"Exit rights are constitutional. Self-hosting proves they work."*
> — ATLAS, Infrastructure Sentinel

---

## Quick Reference

| Task | Command |
|------|---------|
| Start node | `docker-compose up -d` |
| Stop node | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Backup | `kaizen export --full > backup.tar.gz` |
| Restore | `kaizen import --full backup.tar.gz` |
| Upgrade | `kaizen upgrade` |
| Health check | `curl localhost:3000/api/health` |
| Federation status | `kaizen federate status` |

---

[← Back to Pro Landing Page](./PRO_LANDING_PAGE.md) | [Federation Protocol →](./FEDERATION_PROTOCOL_BRIEF.md)
