# Thought Broker Deployment Guide

## 🚀 Quick Deploy to Render

### 1. Create Thought Broker Repository

```bash
# Create new repository
git init thought-broker
cd thought-broker

# Copy the thought-broker files from this workspace
cp -r /workspace/thought-broker/* .

# Initial commit
git add .
git commit -m "feat: initial Thought Broker implementation"
git branch -M main
git remote add origin https://github.com/your-username/thought-broker.git
git push -u origin main
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `thought-broker` repository
5. Configure:
   - **Name**: `thought-broker`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (free tier)

6. Add Environment Variables:
   ```
   LEDGER_BASE_URL=https://civic-ledger.onrender.com
   LEDGER_ADMIN_TOKEN=<generate-secure-token>
   CURSOR_API_URL=https://api.cursor.sh
   CURSOR_API_TOKEN=<your-cursor-token>
   BROKER_MAX_LOOPS=3
   BROKER_SCORE_TAU=0.92
   BROKER_MAX_SECONDS=60
   ALLOW_DISPATCH=false
   ```

7. Click "Create Web Service"

### 3. Test Deployment

```bash
# Get your Render URL (e.g., https://thought-broker.onrender.com)
export BROKER_URL=https://thought-broker.onrender.com

# Test health endpoint
curl $BROKER_URL/v1/loop/health

# Run full test suite
npm run broker:test
```

## 🔧 Lab7-Proof Integration

### 1. Add GitHub Secrets

In your Lab7-proof repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Add new repository secret:
   - **Name**: `BROKER_URL`
   - **Value**: `https://thought-broker.onrender.com`

### 2. Test Integration

```bash
# In Lab7-proof repository
export BROKER_URL=https://thought-broker.onrender.com

# Run broker client
npm run broker:run

# Check generated files
ls -la .civic/
cat .civic/attestation.json
```

### 3. Verify CI Workflow

1. Create a test PR in Lab7-proof
2. Check the "Civic Patch" workflow runs
3. Verify consensus artifacts are generated
4. Review the deliberation proof

## 🛡️ Security Configuration

### 1. Environment Variables

**Required for Production:**
```bash
# Security
NODE_ENV=production
BROKER_MAX_LOOPS=3
BROKER_SCORE_TAU=0.92
BROKER_MAX_SECONDS=60
ALLOW_DISPATCH=false  # Set to true only when ready

# Integrations
LEDGER_BASE_URL=https://your-civic-ledger.com
LEDGER_ADMIN_TOKEN=<secure-token>
CURSOR_API_URL=https://api.cursor.sh
CURSOR_API_TOKEN=<your-token>
```

### 2. Network Security

- Use HTTPS for all external communications
- Implement rate limiting (already included)
- Monitor for unusual activity
- Regular security updates

### 3. Data Protection

- All messages are sanitized before logging
- Secrets are automatically redacted
- Audit trails are immutable
- Full traceability for compliance

## 📊 Monitoring & Observability

### 1. Health Checks

```bash
# Basic health
curl https://thought-broker.onrender.com/v1/loop/health

# Detailed status (if loop exists)
curl https://thought-broker.onrender.com/v1/loop/{loopId}/status
```

### 2. Logs

All activities are logged with structured JSON:
- Loop lifecycle events
- Message generation and validation
- Consensus scoring
- Error conditions
- Security violations

### 3. Metrics

Key metrics to monitor:
- `tb_loop_score`: Consensus quality
- `tb_loop_duration_seconds`: Processing time
- `tb_loops_total`: Total loops executed
- Error rates and types

## 🔄 Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update

# Test after updates
npm run broker:test

# Deploy updates
git add .
git commit -m "chore: update dependencies"
git push
```

### 2. Backup Strategy

- Audit logs are automatically preserved
- Consensus artifacts are stored in `.civic/`
- Attestation proofs are immutable
- Regular database backups (if using persistent storage)

### 3. Scaling Considerations

- Current implementation uses in-memory storage
- For production scale, consider Redis or database
- Monitor memory usage and response times
- Implement horizontal scaling if needed

## 🚨 Troubleshooting

### Common Issues

1. **Loop Timeout**
   - Check `BROKER_MAX_SECONDS` setting
   - Verify external API connectivity
   - Review model response times

2. **Consensus Score Too Low**
   - Adjust `BROKER_SCORE_TAU` threshold
   - Review model quality and prompts
   - Check citation requirements

3. **Dispatch Failures**
   - Verify `CURSOR_API_TOKEN` is valid
   - Check `ALLOW_DISPATCH` setting
   - Review Cursor API rate limits

4. **Attestation Failures**
   - Verify `LEDGER_BASE_URL` is accessible
   - Check `LEDGER_ADMIN_TOKEN` permissions
   - Review ledger service health

### Debug Mode

```bash
# Enable debug logging
export NODE_ENV=development
npm run dev

# Check detailed logs
tail -f logs/thought-broker.log
```

## 📈 Performance Optimization

### 1. Response Time

- Current: ~3-5 seconds per loop
- Target: <2 seconds per loop
- Optimize model calls and scoring

### 2. Memory Usage

- Monitor with `htop` or similar
- Consider message cleanup for long-running instances
- Implement garbage collection tuning

### 3. Concurrent Loops

- Current: Single-threaded
- Future: Worker threads for parallel processing
- Queue system for high-volume scenarios

## 🔮 Future Enhancements

1. **Real LLM Integration**
   - Replace stubbed models with OpenAI/Anthropic
   - Implement model routing and fallbacks
   - Add model-specific optimizations

2. **Advanced Scoring**
   - Machine learning-based consensus scoring
   - Domain-specific quality metrics
   - Dynamic threshold adjustment

3. **Visual Dashboard**
   - Real-time loop monitoring
   - Consensus quality visualization
   - Audit trail exploration

4. **Multi-Repository Support**
   - Cross-repo deliberation
   - Federated consensus building
   - Distributed attestation

---

**Need Help?** Check the logs, run the test suite, or review the audit trail for detailed debugging information.