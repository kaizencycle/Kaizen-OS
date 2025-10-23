# OAA Central Hub Integration Guide

## Quick Integration Steps

### 1. Lab4 Frontend Integration

Add the OAA Tab to your frontend navigation:

```tsx
// In your main App component or navigation
import OaaTab from './oaa/OaaTab';

// Add to your tab navigation
<TabPanel value="oaa">
  <OaaTab />
</TabPanel>
```

### 2. Lab6 Gateway Integration

Deploy the Citizen Shield Gateway with HMAC protection:

```bash
# Set environment variables
export ENABLE_HMAC_AUTH=true
export HMAC_SECRET_KEY=your-secret-key-here
export GATEWAY_PORT=8003

# Start the gateway
cd lab6-citizen-shield
npm start
```

### 3. Lab7 OAA Integration

The hub automatically integrates with existing OAA services. Ensure your OAA API is running:

```bash
# Start OAA API
cd /workspace
uvicorn app.main:app --reload --port 8000
```

### 4. Start the Central Hub

```bash
# Install dependencies
cd oaa
npm install

# Start the hub
npm run dev
```

The hub will be available at `http://localhost:8000/oaa`

## API Integration

### Planning Endpoint
```bash
curl -X POST http://localhost:8000/oaa/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goals": {"type": "fetch_data", "url": "https://github.com"},
    "state": {"current_step": "planning"},
    "context": {"user_initiated": true}
  }'
```

### Execution Endpoint
```bash
curl -X POST http://localhost:8000/oaa/act \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "webDataScout",
    "args": {"url": "https://github.com", "selector": "h1"},
    "context": {"plan_id": "plan_123"}
  }'
```

### Status Endpoint
```bash
curl http://localhost:8000/oaa/status
```

## Environment Variables

Create a `.env` file in the oaa directory:

```bash
# Tool endpoints
SCOUT_ENDPOINT=http://localhost:8001/scout
SENTINEL_ENDPOINT=http://localhost:8002/sentinel

# OAA integration
OAA_ENDPOINT=http://localhost:8000

# Policy configuration
POLICY_FILE=ops/policy.json

# Logging
OPS_LOGS_DIR=.github/ops_logs
NODE_ENV=development
```

## Testing the Integration

1. **Start all services:**
   ```bash
   # Terminal 1: OAA API
   uvicorn app.main:app --reload --port 8000
   
   # Terminal 2: Central Hub
   cd oaa && npm run dev
   
   # Terminal 3: Frontend (if using)
   cd frontend/reflections-app && npm run dev
   ```

2. **Test the hub:**
   - Visit `http://localhost:8000/oaa/status` to see system status
   - Use the frontend OAA Tab to execute actions
   - Check logs in `.github/ops_logs/` for execution traces

3. **Verify integration:**
   - All labs should show as healthy in status
   - Tools should be available and responding
   - Circuit breakers should be in "closed" state

## Troubleshooting

### Common Issues

1. **Tool not found errors:**
   - Check that tool endpoints are correctly configured
   - Verify environment variables are set
   - Ensure target services are running

2. **Policy violations:**
   - Check `ops/policy.json` configuration
   - Verify domain allowlists
   - Review tool-specific policies

3. **Circuit breaker open:**
   - Check tool health and availability
   - Review error logs for failure patterns
   - Wait for recovery timeout or manually reset

4. **Frontend integration issues:**
   - Ensure CORS is configured correctly
   - Check API endpoint URLs
   - Verify React component imports

### Debug Mode

Enable debug logging:

```bash
export DEBUG=oaa:*
npm run dev
```

### Health Checks

Monitor system health:

```bash
# Check hub status
curl http://localhost:8000/oaa/status | jq

# Check individual lab health
curl http://localhost:8000/health
curl http://localhost:8000/oaa/health
```

## Next Steps

1. **Customize Policies** - Modify `ops/policy.json` for your specific needs
2. **Add New Tools** - Extend the registry with additional tools
3. **Enhance Planning** - Implement more sophisticated planning logic
4. **Monitor Performance** - Set up observability dashboards
5. **Scale Deployment** - Configure for production environments

---

**OAA Central Hub** - Your unified nervous system is now ready! 🧠⚡