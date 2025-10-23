# Civic Protocol Core - Deployment Guide

This guide covers deploying the complete Civic Protocol Core system with the Ledger API as the central blockchain kernel.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lab4-Proof    │    │   Lab6-Proof    │    │   GIC-Indexer   │
│  (Reflections)  │    │  (Citizen       │    │  (Balance       │
│                 │    │   Shield)       │    │   Computation)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Ledger API            │
                    │  (Blockchain Kernel)      │
                    │  - Immutable Events       │
                    │  - Token Verification     │
                    │  - Event Chaining         │
                    └───────────────────────────┘
```

## Deployment Options

### Option 1: Individual Services (Recommended for Development)

Deploy each service separately for maximum flexibility:

1. **Ledger API** (Core service)
2. **Lab4-Proof** (Reflections & Agora)
3. **Lab6-Proof** (Citizen Shield)
4. **GIC-Indexer** (Balance computation)

### Option 2: Monolithic Deployment (Simple Setup)

Deploy all services together using Docker Compose.

## Individual Service Deployment

### 1. Ledger API (Blockchain Kernel)

The Ledger API is the core service that all other components write to.

#### Prerequisites
- Python 3.8+
- SQLite3
- Environment variables configured

#### Environment Variables
```bash
# Required
LAB4_API_BASE=https://your-lab4-api.com
LEDGER_DB_PATH=./data/ledger.db

# Optional
LAB6_API_BASE=https://your-lab6-api.com
VERIFY_SIGNATURES=true
```

#### Deployment Steps

**Local Development:**
```bash
cd ledger
pip install -r requirements.txt
export LAB4_API_BASE=https://hive-api-2le8.onrender.com
export LEDGER_DB_PATH=./data/ledger.db
python app/main.py
```

**Production (Render):**
1. Connect GitHub repository
2. Set environment variables:
   - `LAB4_API_BASE`: Your Lab4 API URL
   - `LAB6_API_BASE`: Your Lab6 API URL (optional)
   - `LEDGER_DB_PATH`: `./data/ledger.db`
3. Deploy

**Production (Railway):**
1. Connect GitHub repository
2. Set environment variables
3. Deploy

**Production (Fly.io):**
```bash
# Create fly.toml
fly launch
fly secrets set LAB4_API_BASE=https://your-lab4-api.com
fly deploy
```

#### Health Check
```bash
curl https://your-ledger-api.com/health
```

### 2. Lab4-Proof (Reflections & Agora)

#### Prerequisites
- Python 3.8+
- Access to Ledger API
- Authentication system

#### Environment Variables
```bash
# Required
LEDGER_API_BASE=https://your-ledger-api.com
DATABASE_URL=postgresql://user:pass@host:port/db

# Optional
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://your-frontend.com
```

#### Integration with Ledger
Add to your Lab4 service:

```python
from sdk.python.anchor import create_lab4_anchor

# Create anchor helper
anchor = create_lab4_anchor("https://your-ledger-api.com")

# After creating a reflection
def create_reflection(user_id, title, content):
    # ... existing reflection creation logic ...
    
    # Anchor to ledger
    try:
        anchor.anchor_event(
            event_type="reflection_created",
            civic_id=user_id,
            payload={
                "title": title,
                "content": content,
                "visibility": "public"
            },
            token=user_token
        )
    except Exception as e:
        print(f"Failed to anchor reflection: {e}")
```

### 3. Lab6-Proof (Citizen Shield)

#### Prerequisites
- Python 3.8+
- Access to Ledger API
- zkRL implementation (mocked for now)

#### Environment Variables
```bash
# Required
LEDGER_API_BASE=https://your-ledger-api.com
SHIELD_DB_PATH=./data/shield.db

# Optional
ZK_VERIFICATION=true
RATE_LIMIT_ENABLED=true
```

#### Integration with Ledger
Add to your Lab6 service:

```python
from sdk.python.anchor import create_lab6_anchor

# Create anchor helper
anchor = create_lab6_anchor("https://your-ledger-api.com")

# After shield verification
def verify_reflection(civic_id, proof_data):
    # ... existing verification logic ...
    
    # Anchor to ledger
    try:
        anchor.anchor_event(
            event_type="shield_verification",
            civic_id=civic_id,
            payload={
                "verification_type": "reflection_rate_limit",
                "result": "verified",
                "proof_data": proof_data
            },
            token=user_token
        )
    except Exception as e:
        print(f"Failed to anchor verification: {e}")
```

### 4. GIC-Indexer (Balance Computation)

#### Prerequisites
- Python 3.8+
- Access to Ledger API
- SQLite3

#### Environment Variables
```bash
# Required
LEDGER_API_BASE=https://your-ledger-api.com
INDEX_DB_PATH=./data/index.db
POLICY_PATH=./policy.yaml

# Optional
UPDATE_INTERVAL=300  # 5 minutes
```

#### Integration with Ledger
The GIC-Indexer reads events from the Ledger API and computes balances:

```python
# In your indexer service
def update_balances():
    # Get events from ledger
    events = ledger_client.get_events(
        event_type="reflection_created",
        limit=1000
    )
    
    # Process events and update balances
    for event in events['events']:
        # Calculate GIC rewards
        # Update balance database
        pass
```

## Monolithic Deployment (Docker Compose)

For simple setup, deploy all services together:

### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  ledger-api:
    build: ./ledger
    ports:
      - "8000:8000"
    environment:
      - LAB4_API_BASE=http://lab4-proof:8001
      - LAB6_API_BASE=http://lab6-proof:8002
      - LEDGER_DB_PATH=./data/ledger.db
    volumes:
      - ledger_data:/app/data

  lab4-proof:
    build: ./lab4-proof
    ports:
      - "8001:8001"
    environment:
      - LEDGER_API_BASE=http://ledger-api:8000
    depends_on:
      - ledger-api

  lab6-proof:
    build: ./lab6-proof
    ports:
      - "8002:8002"
    environment:
      - LEDGER_API_BASE=http://ledger-api:8000
    depends_on:
      - ledger-api

  gic-indexer:
    build: ./gic-indexer
    ports:
      - "8003:8003"
    environment:
      - LEDGER_API_BASE=http://ledger-api:8000
    depends_on:
      - ledger-api

volumes:
  ledger_data:
```

### 2. Deploy

```bash
docker-compose up -d
```

## Production Considerations

### Security
- Use HTTPS for all services
- Implement proper authentication
- Enable signature verification
- Use environment variables for secrets
- Implement rate limiting

### Monitoring
- Health check endpoints
- Log aggregation
- Metrics collection
- Error tracking

### Scaling
- Database optimization
- Caching strategies
- Load balancing
- Horizontal scaling

### Backup
- Regular database backups
- Event log archiving
- Disaster recovery plan

## Testing the Deployment

### 1. Health Checks
```bash
# Check all services
curl https://your-ledger-api.com/health
curl https://your-lab4-api.com/health
curl https://your-lab6-api.com/health
curl https://your-indexer-api.com/health
```

### 2. Integration Test
```bash
# Run the full integration test
python examples/full-integration-example.py
```

### 3. Ledger Verification
```bash
# Check ledger stats
curl https://your-ledger-api.com/ledger/stats

# Check chain integrity
curl https://your-ledger-api.com/ledger/chain
```

## Troubleshooting

### Common Issues

1. **Token Verification Failed**
   - Check LAB4_API_BASE and LAB6_API_BASE URLs
   - Verify authentication tokens
   - Check network connectivity

2. **Database Errors**
   - Check database permissions
   - Verify database path
   - Check disk space

3. **Service Communication**
   - Check service URLs
   - Verify network connectivity
   - Check firewall rules

### Logs
```bash
# Check service logs
docker-compose logs ledger-api
docker-compose logs lab4-proof
docker-compose logs lab6-proof
docker-compose logs gic-indexer
```

## Next Steps

After successful deployment:

1. **Monitor Services**: Set up monitoring and alerting
2. **Scale Up**: Add more instances as needed
3. **Enhance Security**: Implement additional security measures
4. **Add Features**: Implement additional event types
5. **Build Frontend**: Create user interfaces for the services

## Support

For deployment issues:
- Check the logs
- Review environment variables
- Test individual services
- Contact the development team
