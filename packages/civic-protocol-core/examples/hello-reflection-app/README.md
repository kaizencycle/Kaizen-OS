# Hello Reflection App

A simple example application that demonstrates how to use the Civic Protocol Core SDKs to create and manage civic reflections.

## Overview

This example app shows how to:
- Connect to the Civic Ledger API
- Create new reflections
- List existing reflections
- Cast votes in governance
- Check GIC balances
- View civic cycles

## Prerequisites

- Node.js 16+ or Python 3.8+
- Civic Protocol Core dev node running on localhost:5411

## Quick Start

### 1. Start the Dev Node

```bash
# From the civic-protocol-core directory
python sdk/python/devnode.py
```

### 2. Run the Example

#### Python Version

```bash
cd examples/hello-reflection-app
python app.py
```

#### JavaScript Version

```bash
cd examples/hello-reflection-app
npm install
node app.js
```

## Example Code

### Python Example

```python
from sdk.python.client import CivicClient

# Create client
client = CivicClient()

# Add a reflection
reflection = client.add_reflection(
    "Cycle 0 Hello",
    "We heal as we walk.",
    ["hello", "cycle0"],
    "public"
)
print(f"Created reflection: {reflection.ref_id}")

# List reflections
reflections = client.list_reflections(limit=10)
print(f"Found {reflections['total']} reflections")

# Get balance
balance = client.get_balance("citizen_001")
print(f"Balance: {balance.balance} GIC")
```

### JavaScript Example

```javascript
import { CivicClient } from '../sdk/js/index.js';

// Create client
const client = new CivicClient();

// Add a reflection
const reflection = await client.addReflection({
    title: "Cycle 0 Hello",
    body: "We heal as we walk.",
    tags: ["hello", "cycle0"],
    visibility: "public"
});
console.log(`Created reflection: ${reflection.ref_id}`);

// List reflections
const reflections = await client.listReflections({ limit: 10 });
console.log(`Found ${reflections.total} reflections`);

// Get balance
const balance = await client.getBalance("citizen_001");
console.log(`Balance: ${balance.balance} GIC`);
```

## API Endpoints Used

- `POST /reflections` - Create new reflections
- `GET /reflections` - List reflections with filtering
- `GET /reflections/{id}` - Get specific reflection
- `POST /attestations` - Create attestations
- `POST /agora/votes` - Cast governance votes
- `GET /cycles` - List civic cycles
- `GET /balance/{address}` - Get GIC balance
- `GET /earn/events` - Get earning events

## Features Demonstrated

### Reflection Management
- Creating public and private reflections
- Tagging reflections for organization
- Filtering reflections by author, visibility, and tags
- Pagination support

### Governance Participation
- Casting votes on proposals
- Viewing vote history
- Understanding voting weights

### Economic Activity
- Checking GIC balances
- Viewing earning events
- Understanding the economic model

### Civic Cycles
- Viewing daily civic cycles
- Understanding the Seed → Sweep → Seal → Ledger process
- Tracking civic activity metrics

## Error Handling

The example includes proper error handling for:
- Network connectivity issues
- API authentication errors
- Invalid request parameters
- Rate limiting
- Server errors

## Next Steps

After running this example, you can:

1. **Explore the API**: Try different endpoints and parameters
2. **Build Your App**: Use the SDKs to build your own civic application
3. **Contribute**: Add new features or improve existing ones
4. **Deploy**: Learn how to deploy your app to production

## Resources

- [Civic Protocol Core Documentation](../docs/)
- [OpenAPI Specification](../docs/openapi.yaml)
- [Python SDK Reference](../sdk/python/)
- [JavaScript SDK Reference](../sdk/js/)
- [App Registry](../registry/)

## Support

For questions or issues:
- Open an issue on GitHub
- Join our community discussions
- Check the documentation

