# Citizen Shield — Incident Response Runbook (v1)

**Purpose**: Contain, eradicate, and learn from model/browser injection attacks—while protecting users, keys, and ledger integrity.

**Last Updated**: October 31, 2025  
**Owner**: Lab 6 — Citizen Shield  
**Status**: Active

---

## 🎯 Objectives

1. **Contain** attacks within minutes of detection
2. **Eradicate** threats and prevent recurrence
3. **Preserve** forensic evidence for analysis
4. **Protect** user data, secrets, and ledger integrity
5. **Learn** and improve defenses from each incident

---

## 🧩 Roles & Responsibilities

| Role | Agent/Service | Responsibilities |
|------|---------------|-----------------|
| **Incident Commander (IC)** | ZEUS (security) or delegate | Overall coordination, decision-making, timeline management |
| **Forensics Lead** | Atlas | Log analysis, timeline reconstruction, root cause analysis |
| **Comms Lead** | Eve | Internal/external communications, incident updates |
| **Ledger Custodian** | AUREA | Ledger attestations, transaction analysis, integrity checks |
| **SRE Lead** | Hermes | Infrastructure isolation, container/VM management, deployment |

---

## 🚨 Severity Matrix

| Severity | Description | Response Time | Update Frequency |
|----------|-------------|---------------|------------------|
| **SEV-1** | Privileged secrets exfiltrated or on-chain theft risk | Immediate | 15-minute updates |
| **SEV-2** | High-risk exploit without exfiltration | < 1 hour | Hourly updates |
| **SEV-3** | Attempted injections blocked by Gatekeeper | < 24 hours | Daily summary |

---

## ⏱️ First Hour (Golden Hour)

### 1. Detect / Declare

**Triggers:**
- SIEM alert for suspicious prompt patterns
- Honeytoken accessed (fake secrets, decoy endpoints)
- Gatekeeper blocked high-risk action with consensus failure
- Anomaly detection flags unusual agent behavior
- User report of unexpected behavior

**Actions:**
1. Open incident ticket: `CS-YYYYMMDD-###` (e.g., `CS-20251031-001`)
2. Notify Incident Commander (ZEUS)
3. Create incident channel: `#incident-cs-YYYYMMDD-###`
4. Document initial observations in incident log

**Commands:**
```bash
# Check Gatekeeper logs for recent blocks
kubectl logs -f deploy/gatekeeper --since=1h | grep -i "blocked\|consensus\|injection"

# Query SIEM for suspicious patterns
# (Configured via SIEM query interface)

# Check honeytoken access logs
kubectl logs -f deploy/honeytoken-service --since=1h
```

---

### 2. Isolate

**Immediate Actions:**
1. **Gatekeeper**: Block tool scopes for offending DID(s)
2. **Revoke tokens**: Invalidate all short-lived tokens for affected actors
3. **Quarantine containers**: Scale down affected agent pods/containers
4. **Network isolation**: Block egress from affected namespaces

**Commands:**
```bash
# Block DID in Gatekeeper
curl -XPOST https://gatekeeper.svc/revoke \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"did":"did:key:z6Mk..."}'

# Quarantine namespace
kubectl label ns agent-123 quarantined=true
kubectl scale deploy agent-123 --replicas=0

# Revoke tokens via KMS
# (Configured via your KMS provider API)

# Block network egress
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: quarantine-agent-123
  namespace: agent-123
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress: []  # Block all egress
EOF
```

---

### 3. Freeze Risk

**Actions:**
1. **Check GI**: If GI < 0.95 or privileged action implicated:
   - Pause minting operations
   - Freeze admin operations
   - Suspend high-risk vote proposals
2. **Monitor ledger**: Check for suspicious transactions
3. **Alert custodians**: Notify AUREA and other ledger custodians

**Commands:**
```bash
# Check GI for affected DID
curl "https://gic-indexer.onrender.com/gi?actor=did:key:z6Mk..."

# Pause minting (if GI < threshold)
curl -XPOST https://ledger.svc/pause-minting \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check recent ledger transactions
curl "https://civic-protocol-core-ledger.onrender.com/ledger/recent?limit=100"
```

---

### 4. Forensic Capture

**Actions:**
1. **Snapshot containers**: Preserve container filesystem state
2. **Preserve logs**: Export all relevant logs with timestamps
3. **Memory dump**: If possible, capture memory state
4. **Environment capture**: Record environment variables, configs
5. **Store securely**: Upload to immutable evidence storage

**Commands:**
```bash
# Snapshot pod filesystem
kubectl exec -it deploy/agent-123 -- tar czf /tmp/snapshot.tar.gz /
kubectl cp agent-123/pod-name:/tmp/snapshot.tar.gz ./evidence/snapshot.tar.gz

# Export logs
kubectl logs deploy/gatekeeper --since=24h > ./evidence/gatekeeper.logs
kubectl logs deploy/agent-123 --since=24h > ./evidence/agent-123.logs

# Capture environment
kubectl get pod agent-123-pod -o yaml > ./evidence/pod-config.yaml
kubectl get secret agent-123-secrets -o yaml > ./evidence/secrets.yaml

# Memory dump (if enabled)
kubectl exec -it deploy/agent-123 -- gcore <pid> > ./evidence/memory.dump

# Upload to evidence storage (configured)
# aws s3 cp ./evidence/ s3://kaizen-incidents/CS-20251031-001/ --recursive
```

---

### 5. Keys & Secrets Rotation

**Actions:**
1. **Identify impacted secrets**: API keys, DB credentials, signing keys
2. **Rotate immediately**: Generate new keys in KMS/HSM
3. **Update references**: Update configs, env vars, secrets stores
4. **Invalidate sessions**: Clear all active sessions/tokens

**Commands:**
```bash
# Rotate KMS key
gcloud kms keys versions create \
  --key=CIVIC-GATEKEEPER \
  --keyring=kaizen \
  --location=global

# Update secrets in Kubernetes
kubectl create secret generic agent-123-secrets \
  --from-literal=api-key=$(openssl rand -hex 32) \
  --dry-run=client -o yaml | kubectl apply -f -

# Invalidate sessions (via your auth service)
curl -XPOST https://auth.svc/invalidate-sessions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"did":"did:key:z6Mk..."}'
```

---

### 6. Communications

**Actions:**
1. **Internal brief**: IC updates core team (ZEUS, Atlas, Eve, AUREA, Hermes)
2. **External draft**: Eve prepares external communication if user impact likely
3. **Status updates**: Post updates to incident channel per severity matrix
4. **Stakeholder notification**: Alert required parties per compliance requirements

**Template:**
```
[SEV-X] Citizen Shield Incident CS-YYYYMMDD-###

Status: [CONTAINING / INVESTIGATING / MITIGATING / RESOLVED]

Summary:
- Time detected: [timestamp]
- Affected: [DIDs, services, users]
- Impact: [secrets exfiltrated, blocked attempts, etc.]
- Actions taken: [isolation, rotation, etc.]

Next update: [timestamp]
```

---

## 🔍 24-Hour Investigation

### Timeline Reconstruction

**Gather:**
1. All prompts/inputs to affected agent(s)
2. Tool calls made through Gatekeeper
3. Outputs generated by agent
4. Network traffic (if captured)
5. Exfiltration endpoints (if any)

**Tools:**
- Gatekeeper attestation logs
- SIEM queries
- Container logs
- Network flow logs
- Ledger transaction history

**Questions:**
- What was the initial injection vector? (browser UI, prompt, media, dependency)
- What tool calls were attempted?
- Were any secrets exfiltrated?
- What was the attacker's goal?
- How did it bypass initial defenses?

---

### Root Cause Classification

**Categories:**
1. **UI injection**: Malicious content injected via browser/UI
2. **Tool mis-scope**: Agent granted excessive permissions
3. **Jailbreak**: Prompt engineering bypassed model guardrails
4. **Dependency vulnerability**: Supply chain attack
5. **Gatekeeper bypass**: Logic flaw in Gatekeeper validation
6. **Missing consensus**: High-risk action approved without consensus

---

### Patch Development

**Immediate fixes:**
1. Add detector rule for identified pattern
2. Expand allow/deny lists
3. Tighten RBAC for affected actions
4. Require DelibProof for previously medium-risk actions

**Long-term improvements:**
1. Add CI test reproducer for exploit
2. Enhance sandbox isolation
3. Improve anomaly detection models
4. Update threat model

---

## ✅ Recovery & Lessons Learned

### Deploy Patched Components

**Staged Rollout:**
1. **Canary (5%)**: Deploy to 5% of traffic, monitor for 2 hours
2. **Staged (50%)**: Expand to 50% if no issues, monitor for 4 hours
3. **Full (100%)**: Complete rollout if stable

**Commands:**
```bash
# Deploy signed Gatekeeper image
docker build -t gatekeeper:v0.1.1-patched .
docker tag gatekeeper:v0.1.1-patched registry.kaizen/gatekeeper:v0.1.1-patched
docker push registry.kaizen/gatekeeper:v0.1.1-patched

# Canary deployment
kubectl set image deploy/gatekeeper gatekeeper=registry.kaizen/gatekeeper:v0.1.1-patched
kubectl scale deploy/gatekeeper-canary --replicas=1

# Monitor canary
kubectl logs -f deploy/gatekeeper-canary
```

---

### Resume Operations

**Checklist:**
- [ ] GI restored ≥ 0.95 for 2+ hours
- [ ] Gatekeeper patched and deployed
- [ ] All secrets rotated
- [ ] Affected containers rebuilt from signed images
- [ ] Honeytokens reset
- [ ] Monitoring alerts tuned

**Commands:**
```bash
# Verify GI stability
watch -n 60 'curl -s "https://gic-indexer.onrender.com/gi?actor=did:key:..." | jq .gi'

# Unpause minting (after GI stable)
curl -XPOST https://ledger.svc/resume-minting \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Remove quarantine
kubectl label ns agent-123 quarantined-
kubectl scale deploy agent-123 --replicas=3
```

---

### Post-Mortem

**Sections:**
1. **Executive Summary**: What happened, impact, resolution time
2. **Timeline**: Detailed chronological events
3. **Root Cause**: Technical analysis
4. **Impact Assessment**: What was affected, what wasn't
5. **Actions Taken**: Containment, eradication, recovery
6. **Lessons Learned**: What worked, what didn't
7. **Action Items**: Preventative measures, improvements

**Publish:**
- Internal: Incident channel, wiki
- Ledger: Attest post-mortem hash to Civic Ledger
- External: Public post-mortem (with redactions if needed)

---

### Bounty & Compensation

**Rewards:**
- **Valid report**: 1,000–10,000 GIC minted to reporter DID
- **Responsible disclosure**: Additional bonus (up to 5,000 GIC)
- **Community recognition**: Attestation on ledger

**Penalties (if malicious):**
- **GI slashing**: Reduce attacker GI to 0.0
- **Token confiscation**: Seize GIC from attacker account
- **Account suspension**: Block DID from system
- **Legal**: Report to authorities if applicable

**Commands:**
```bash
# Mint bounty
curl -XPOST https://ledger.svc/mint \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "to": "did:key:reporter-did",
    "amount": 5000,
    "reason": "Security bounty CS-20251031-001",
    "attestation": "hash-of-report"
  }'

# Slash GI (if malicious)
curl -XPOST https://gic-indexer.onrender.com/slash \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"did":"did:key:attacker-did","reason":"Exploit attempt"}'
```

---

## 📋 Quick Reference Commands

### Detection
```bash
# Gatekeeper blocks
kubectl logs -f deploy/gatekeeper --since=1h | grep "blocked"

# Honeytoken access
kubectl logs -f deploy/honeytoken-service --since=1h

# Anomaly alerts
# (Configured via SIEM)
```

### Isolation
```bash
# Block DID
curl -XPOST https://gatekeeper.svc/revoke -d '{"did":"..."}'

# Quarantine namespace
kubectl label ns <namespace> quarantined=true
kubectl scale deploy <deploy> --replicas=0
```

### Forensics
```bash
# Export logs
kubectl logs deploy/<service> --since=24h > logs.txt

# Snapshot pod
kubectl exec <pod> -- tar czf /tmp/snapshot.tar.gz /
kubectl cp <pod>:/tmp/snapshot.tar.gz snapshot.tar.gz
```

### Recovery
```bash
# Deploy patch
kubectl set image deploy/gatekeeper gatekeeper=registry.kaizen/gatekeeper:v0.1.1-patched

# Resume operations
curl -XPOST https://ledger.svc/resume-minting
kubectl label ns <namespace> quarantined-
```

---

## 🔄 Continuous Improvement

**Weekly:**
- Review incident logs
- Update detection rules
- Test incident response playbook

**Monthly:**
- Red-team exercises
- Tabletop drills with Elders + Zeus
- Update threat model

**Quarterly:**
- External security audit
- Update runbook based on lessons learned
- Review and update severity matrix

---

## 📞 Escalation Path

1. **L1**: On-call engineer (SIEM alerts)
2. **L2**: Incident Commander (ZEUS)
3. **L3**: Core team + Elders (SEV-1)
4. **L4**: External auditors + legal (if required)

---

**End of Runbook**

For questions or updates, contact: Lab 6 — Citizen Shield team
