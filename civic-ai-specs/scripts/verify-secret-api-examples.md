# Secret API Examples and Verification

This document provides examples of how to use the quest secret generation and verification system.

## Secret Generation

### Basic Usage

```bash
# Generate random secrets for all quests
node scripts/quests-bulk-secret.mjs

# Generate secrets with specific type
node scripts/quests-bulk-secret.mjs hash

# Generate and save secrets to CSV
node scripts/quests-bulk-secret.mjs random --write

# Generate and save secrets to JSON
node scripts/quests-bulk-secret.mjs uuid --write --json
```

### Secret Types

- `random`: Random hexadecimal string (default)
- `hash`: SHA-256 hash of quest ID and timestamp
- `uuid`: Standard UUID v4
- `base64`: Base64-encoded random bytes
- `hex`: Hexadecimal random bytes
- `words`: Hyphenated random words

## Secret Verification

### API Endpoints

#### GET /api/quests/{quest_id}/secret
Retrieve the secret for a specific quest.

**Response:**
```json
{
  "quest_id": "main_cathedral_oath",
  "secret_value": "a1b2c3d4e5f6...",
  "generated_at": "2025-01-01T00:00:00Z",
  "status": "active"
}
```

#### POST /api/quests/{quest_id}/verify
Verify a secret for a quest.

**Request:**
```json
{
  "secret_value": "a1b2c3d4e5f6...",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "verified": true,
  "quest_id": "main_cathedral_oath",
  "user_id": "user123",
  "verified_at": "2025-01-01T00:00:00Z",
  "rewards": {
    "gic": 100,
    "experience": 50,
    "items": ["cathedral_key", "oath_medallion"]
  }
}
```

#### GET /api/quests/secrets/status
Get status of all quest secrets.

**Response:**
```json
{
  "total_quests": 10,
  "active_secrets": 8,
  "verified_secrets": 2,
  "expired_secrets": 0,
  "last_updated": "2025-01-01T00:00:00Z"
}
```

## Integration Examples

### Node.js Integration

```javascript
import fetch from 'node-fetch';

class QuestSecretAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getQuestSecret(questId) {
    const response = await fetch(`${this.baseURL}/api/quests/${questId}/secret`);
    return await response.json();
  }

  async verifyQuestSecret(questId, secretValue, userId) {
    const response = await fetch(`${this.baseURL}/api/quests/${questId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_value: secretValue, user_id: userId })
    });
    return await response.json();
  }

  async getSecretsStatus() {
    const response = await fetch(`${this.baseURL}/api/quests/secrets/status`);
    return await response.json();
  }
}

// Usage
const api = new QuestSecretAPI('https://api.example.com');
const secret = await api.getQuestSecret('main_cathedral_oath');
console.log('Secret:', secret.secret_value);
```

### Python Integration

```python
import requests
import json

class QuestSecretAPI:
    def __init__(self, base_url):
        self.base_url = base_url

    def get_quest_secret(self, quest_id):
        response = requests.get(f"{self.base_url}/api/quests/{quest_id}/secret")
        return response.json()

    def verify_quest_secret(self, quest_id, secret_value, user_id):
        data = {
            "secret_value": secret_value,
            "user_id": user_id
        }
        response = requests.post(
            f"{self.base_url}/api/quests/{quest_id}/verify",
            json=data
        )
        return response.json()

    def get_secrets_status(self):
        response = requests.get(f"{self.base_url}/api/quests/secrets/status")
        return response.json()

# Usage
api = QuestSecretAPI("https://api.example.com")
secret = api.get_quest_secret("main_cathedral_oath")
print(f"Secret: {secret['secret_value']}")
```

### JavaScript/TypeScript Integration

```typescript
interface QuestSecret {
  quest_id: string;
  secret_value: string;
  generated_at: string;
  status: string;
}

interface VerificationResult {
  verified: boolean;
  quest_id: string;
  user_id: string;
  verified_at: string;
  rewards: {
    gic: number;
    experience: number;
    items: string[];
  };
}

class QuestSecretAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getQuestSecret(questId: string): Promise<QuestSecret> {
    const response = await fetch(`${this.baseURL}/api/quests/${questId}/secret`);
    return await response.json();
  }

  async verifyQuestSecret(
    questId: string, 
    secretValue: string, 
    userId: string
  ): Promise<VerificationResult> {
    const response = await fetch(`${this.baseURL}/api/quests/${questId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_value: secretValue, user_id: userId })
    });
    return await response.json();
  }

  async getSecretsStatus(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/quests/secrets/status`);
    return await response.json();
  }
}

export default QuestSecretAPI;
```

## Security Considerations

### Secret Storage
- Secrets should be stored securely with proper encryption
- Access to secrets should be logged and monitored
- Secrets should have expiration times
- Regular rotation of secrets is recommended

### API Security
- Use HTTPS for all API communications
- Implement rate limiting to prevent abuse
- Validate all input parameters
- Use proper authentication and authorization
- Log all secret verification attempts

### Best Practices
- Never log secret values in production
- Use environment variables for sensitive configuration
- Implement proper error handling
- Monitor for suspicious activity
- Regular security audits

## Testing

### Unit Tests

```javascript
import { QuestSecretAPI } from './quest-secret-api';

describe('QuestSecretAPI', () => {
  let api;

  beforeEach(() => {
    api = new QuestSecretAPI('http://localhost:3000');
  });

  test('should get quest secret', async () => {
    const secret = await api.getQuestSecret('test_quest');
    expect(secret).toHaveProperty('quest_id');
    expect(secret).toHaveProperty('secret_value');
  });

  test('should verify quest secret', async () => {
    const result = await api.verifyQuestSecret('test_quest', 'test_secret', 'user123');
    expect(result).toHaveProperty('verified');
    expect(result).toHaveProperty('quest_id');
  });
});
```

### Integration Tests

```bash
# Test secret generation
npm run test:secrets

# Test API endpoints
npm run test:api

# Test security
npm run test:security
```

## Monitoring and Logging

### Metrics to Track
- Secret generation rate
- Verification success rate
- Failed verification attempts
- API response times
- Error rates

### Logging
- All secret generation events
- All verification attempts (success and failure)
- API access logs
- Security events
- Performance metrics

### Alerts
- High number of failed verifications
- Unusual API usage patterns
- Security breaches
- Performance degradation
- System errors

---

*"We heal as we walk."*