# CIP-0002: Add Webhooks Support

**Title**: Add Webhooks Support for Real-time Event Notifications

**Author**: Civic Protocol Core Team

**Status**: Draft

**Type**: Interface

**Created**: 2024-01-01

**Updated**: 2024-01-01

## Abstract

This proposal adds webhook support to the Civic Ledger API, enabling real-time event notifications for reflections, attestations, votes, and other civic activities. This will improve the developer experience and enable more responsive civic applications.

## Motivation

Currently, applications must poll the API to detect changes, which is inefficient and can miss time-sensitive events. Webhooks will provide:

- Real-time notifications of civic activities
- Reduced API load through event-driven architecture
- Better user experience with instant updates
- Support for complex event processing workflows
- Integration with external systems and services

## Specification

### Overview

The webhook system will allow applications to register endpoints that receive HTTP POST requests when specific events occur in the Civic Protocol.

### Event Types

The following event types will be supported:

#### Reflection Events
- `reflection.created` - New reflection posted
- `reflection.updated` - Reflection updated
- `reflection.deleted` - Reflection deleted
- `reflection.visibility_changed` - Visibility changed

#### Attestation Events
- `attestation.created` - New attestation created
- `attestation.verified` - Attestation verified
- `attestation.revoked` - Attestation revoked

#### Governance Events
- `proposal.created` - New governance proposal
- `proposal.activated` - Proposal activated for voting
- `proposal.passed` - Proposal passed
- `proposal.rejected` - Proposal rejected
- `proposal.executed` - Proposal executed
- `vote.cast` - Vote cast on proposal

#### Cycle Events
- `cycle.started` - New civic cycle started
- `cycle.seed_completed` - Seed phase completed
- `cycle.sweep_completed` - Sweep phase completed
- `cycle.seal_completed` - Seal phase completed
- `cycle.ledger_completed` - Ledger phase completed

#### Economic Events
- `balance.updated` - GIC balance changed
- `reward.earned` - GIC reward earned
- `stake.deposited` - GIC staked
- `stake.withdrawn` - GIC unstaked

### Webhook Registration

#### Register Webhook Endpoint

```http
POST /webhooks
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "url": "https://example.com/webhook",
  "events": ["reflection.created", "vote.cast"],
  "secret": "webhook_secret_key",
  "active": true,
  "retry_policy": {
    "max_attempts": 3,
    "backoff_factor": 2,
    "max_delay": 300
  }
}
```

#### Response

```json
{
  "webhook_id": "wh_1234567890",
  "url": "https://example.com/webhook",
  "events": ["reflection.created", "vote.cast"],
  "secret": "webhook_secret_key",
  "active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Webhook Payload Format

All webhook payloads will follow this structure:

```json
{
  "id": "evt_1234567890",
  "type": "reflection.created",
  "created_at": "2024-01-01T00:00:00Z",
  "data": {
    "reflection": {
      "ref_id": "ref_1234567890",
      "author": "citizen_001",
      "visibility": "public",
      "tags": ["hello", "cycle0"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "webhook_id": "wh_1234567890"
}
```

### Security

#### Signature Verification

All webhook requests will include a signature header for verification:

```http
X-Civic-Signature: sha256=abc123def456...
```

The signature is calculated as:
```
HMAC-SHA256(secret, payload)
```

#### Example Verification

```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

### Retry Policy

Failed webhook deliveries will be retried with exponential backoff:

- **Max Attempts**: 3 (configurable)
- **Backoff Factor**: 2 (doubles each retry)
- **Max Delay**: 300 seconds
- **Retry Events**: 5xx errors, timeouts, network errors

### Rate Limiting

Webhook delivery will be rate limited:

- **Per Endpoint**: 100 requests/minute
- **Per Event Type**: 50 requests/minute
- **Global**: 1000 requests/minute

### API Endpoints

#### List Webhooks

```http
GET /webhooks
Authorization: Bearer <api_key>
```

#### Get Webhook

```http
GET /webhooks/{webhook_id}
Authorization: Bearer <api_key>
```

#### Update Webhook

```http
PUT /webhooks/{webhook_id}
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "events": ["reflection.created", "attestation.created"],
  "active": true
}
```

#### Delete Webhook

```http
DELETE /webhooks/{webhook_id}
Authorization: Bearer <api_key>
```

#### Test Webhook

```http
POST /webhooks/{webhook_id}/test
Authorization: Bearer <api_key>
```

### Event Filtering

Webhooks can be configured with filters:

```json
{
  "url": "https://example.com/webhook",
  "events": ["reflection.created"],
  "filters": {
    "reflection.created": {
      "visibility": "public",
      "tags": ["governance"]
    }
  }
}
```

## Implementation

### Implementation Plan

#### Phase 1: Core Infrastructure (2 weeks)
- Webhook registration and management
- Event collection and queuing
- Basic delivery mechanism
- Signature verification

#### Phase 2: Event Types (2 weeks)
- Reflection events
- Attestation events
- Governance events
- Cycle events

#### Phase 3: Advanced Features (2 weeks)
- Event filtering
- Retry policies
- Rate limiting
- Monitoring and metrics

#### Phase 4: Testing and Documentation (1 week)
- Comprehensive testing
- API documentation
- Integration examples
- Performance optimization

### Timeline

- **Development**: 6 weeks
- **Testing**: 1 week
- **Deployment**: 1 week
- **Total**: 8 weeks

### Resources Required

- **Development**: 2 developers
- **Testing**: 1 QA engineer
- **Infrastructure**: Webhook delivery service
- **Documentation**: API docs and examples

## Examples

### Webhook Registration

```python
from civic_client import CivicClient

client = CivicClient(api_key="your_api_key")

# Register webhook
webhook = client.create_webhook(
    url="https://myapp.com/webhook",
    events=["reflection.created", "vote.cast"],
    secret="my_secret_key"
)

print(f"Webhook created: {webhook.webhook_id}")
```

### Webhook Handler

```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    # Verify signature
    signature = request.headers.get('X-Civic-Signature')
    if not verify_signature(request.data, signature, 'my_secret_key'):
        return 'Unauthorized', 401
    
    # Process event
    event = request.json
    event_type = event['type']
    data = event['data']
    
    if event_type == 'reflection.created':
        handle_reflection_created(data['reflection'])
    elif event_type == 'vote.cast':
        handle_vote_cast(data['vote'])
    
    return 'OK', 200

def handle_reflection_created(reflection):
    print(f"New reflection: {reflection['ref_id']}")
    # Process reflection...

def handle_vote_cast(vote):
    print(f"Vote cast: {vote['choice']}")
    # Process vote...
```

### JavaScript Example

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
    // Verify signature
    const signature = req.headers['x-civic-signature'];
    if (!verifySignature(req.body, signature, 'my_secret_key')) {
        return res.status(401).send('Unauthorized');
    }
    
    // Process event
    const event = req.body;
    console.log(`Received event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
        case 'reflection.created':
            handleReflectionCreated(event.data.reflection);
            break;
        case 'vote.cast':
            handleVoteCast(event.data.vote);
            break;
    }
    
    res.status(200).send('OK');
});

function verifySignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(`sha256=${expectedSignature}`)
    );
}
```

## Testing

### Test Cases

#### Unit Tests
- Webhook registration and validation
- Event filtering logic
- Signature verification
- Retry policy implementation

#### Integration Tests
- End-to-end webhook delivery
- Event type coverage
- Error handling and retries
- Rate limiting behavior

#### Load Tests
- High-volume event processing
- Concurrent webhook deliveries
- System performance under load

### Test Data

```python
# Test webhook payload
test_payload = {
    "id": "evt_test_123",
    "type": "reflection.created",
    "created_at": "2024-01-01T00:00:00Z",
    "data": {
        "reflection": {
            "ref_id": "ref_test_123",
            "author": "citizen_test",
            "visibility": "public",
            "tags": ["test"],
            "created_at": "2024-01-01T00:00:00Z"
        }
    },
    "webhook_id": "wh_test_123"
}
```

## Documentation

### API Documentation

Update required for:
- OpenAPI specification with webhook endpoints
- Event type documentation
- Payload schemas
- Error codes and responses

### Code Documentation

- Webhook service implementation
- Event processing logic
- Security considerations
- Performance optimization

### User Guides

- Webhook setup guide
- Event handling examples
- Security best practices
- Troubleshooting guide

## Governance

### Voting Requirements

- **Quorum Threshold**: 20%
- **Approval Threshold**: 50%
- **Voting Period**: 7 days
- **Execution Delay**: 14 days

### Implementation Approval

- Technical review required
- Security audit required
- Community approval required
- Performance testing required

## Alternatives Considered

### Server-Sent Events (SSE)
- **Pros**: Simpler implementation, real-time updates
- **Cons**: Less reliable, connection management complexity
- **Decision**: Rejected due to reliability concerns

### WebSocket Connections
- **Pros**: Bidirectional communication, real-time updates
- **Cons**: Connection state management, scaling challenges
- **Decision**: Rejected due to complexity

### Polling with Webhooks
- **Pros**: Combines reliability of polling with efficiency of webhooks
- **Cons**: More complex implementation
- **Decision**: Considered for future enhancement

## References

- [Webhook Best Practices](https://webhook.site/)
- [HMAC Signature Verification](https://tools.ietf.org/html/rfc2104)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

## Changelog

- 2024-01-01: Initial draft
- 2024-01-01: Added security considerations
- 2024-01-01: Added implementation timeline

## Discussion

### Community Feedback

- **Concern**: Webhook reliability and delivery guarantees
- **Response**: Implemented retry policies and monitoring
- **Concern**: Security of webhook endpoints
- **Response**: Added signature verification and rate limiting

### Concerns Raised

1. **Performance Impact**: Webhook delivery could impact API performance
   - **Mitigation**: Asynchronous delivery with queuing
2. **Security**: Webhook endpoints could be compromised
   - **Mitigation**: Signature verification and rate limiting
3. **Reliability**: Webhook delivery failures could cause data loss
   - **Mitigation**: Retry policies and monitoring

### Compromise Solutions

- **Event Filtering**: Added to reduce noise and improve performance
- **Rate Limiting**: Added to prevent abuse and ensure fair usage
- **Retry Policies**: Configurable to balance reliability and performance

