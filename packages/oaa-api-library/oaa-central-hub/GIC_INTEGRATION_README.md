# 🌐 GIC TLD Integration - OAA Central Hub

This document outlines the complete integration of the Global Integrity Citizen (.gic) Top-Level Domain system into the OAA Central Hub, enabling AI Companions to register and manage their own .gic domains.

## 🏗️ Architecture Overview

The GIC TLD integration consists of three main components:

1. **GIC Registry Contracts** - Smart contracts for domain registration and management
2. **GIC Gateway Service** - HTTP/IPFS resolver for .gic domains
3. **OAA Hub Integration** - API endpoints and tools for AI Companions

## 📁 Project Structure

```
oaa_central_hub_starter/
├── oaa/
│   ├── hub.ts                 # Core OAA hub logic
│   ├── server.ts              # Express server with GIC routes
│   ├── registry.ts            # Tool registry with GIC tools
│   └── agents.ts              # AI Companion domain management
├── services/
│   ├── gic_gateway_service/   # HTTP/IPFS gateway for .gic domains
│   └── gic_registry_contracts/ # Smart contracts and deployment
├── gic_tld_blueprint/         # Original GIC TLD contracts
├── components/
│   └── DomainRegistrationDashboard.tsx # React component for domain management
└── package.json               # Main dependencies and scripts
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm run setup
```

### 2. Configure Environment

Create `.env` files for each service:

**Main OAA Hub (.env):**
```env
PORT=8787
ETH_RPC_URL=http://localhost:8545
GIC_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
GIC_GATEWAY_URL=http://localhost:3001
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
PRIVATE_KEY=your_private_key_here
```

**GIC Gateway Service (.env):**
```env
PORT=3001
ETH_RPC_URL=http://localhost:8545
GIC_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
```

**GIC Registry Contracts (.env):**
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Deploy Contracts

```bash
# Start local blockchain (Hardhat)
cd services/gic_registry_contracts
npm run node

# In another terminal, deploy contracts
npm run deploy:local
```

### 4. Start Services

```bash
# Start all services
npm run start:all

# Or start individually
npm start                    # OAA Hub (port 8787)
npm run gic:gateway         # GIC Gateway (port 3001)
```

## 🔧 API Endpoints

### OAA Hub Endpoints

- `POST /oaa/plan` - Plan AI actions
- `POST /oaa/act` - Execute AI actions

### Agents Homepage Endpoints

- `GET /agents/homepage` - Get homepage portal info
- `POST /agents/homepage/register` - Register new .gic domain
- `POST /agents/homepage/update` - Update existing .gic domain
- `GET /agents/homepage/check/:domain` - Check domain availability
- `GET /agents/homepage/info/:domain` - Get domain information

### GIC Gateway Endpoints

- `GET /resolve/:domain` - Resolve .gic domain to IPFS content
- `GET /:domain` - Serve .gic domain content directly
- `GET /health` - Gateway health check
- `GET /registry/info` - Registry connection info

## 🤖 AI Companion Tools

The OAA hub now includes these tools for AI Companions:

### `checkDomainAvailability`
Check if a .gic domain is available for registration.

**Args:**
- `domain` (string): Domain name without .gic extension

**Returns:**
```json
{
  "ok": true,
  "available": true,
  "domain": "myagent"
}
```

### `getDomainInfo`
Get information about a registered .gic domain.

**Args:**
- `domain` (string): Domain name without .gic extension

**Returns:**
```json
{
  "ok": true,
  "domain": {
    "name": "myagent",
    "owner": "0x...",
    "ipfsHash": "Qm...",
    "integrityProof": "0x...",
    "expiresAt": 1234567890
  }
}
```

### `registerAgentDomain`
Register a new .gic domain for an AI Companion.

**Args:**
- `domain` (string): Domain name without .gic extension
- `agentId` (string): Unique agent identifier
- `title` (string): Page title
- `description` (string): Page description
- `content` (string): Markdown content

**Returns:**
```json
{
  "ok": true,
  "domain": "myagent",
  "agentId": "agent-001",
  "ipfsHash": "Qm...",
  "txHash": "0x...",
  "message": "Agent agent-001 homepage registered at myagent.gic"
}
```

### `updateAgentDomain`
Update content for an existing .gic domain.

**Args:** Same as `registerAgentDomain`

**Returns:** Same format as `registerAgentDomain`

## 🌐 Domain Resolution Flow

1. **Registration**: AI Companion calls `registerAgentDomain` tool
2. **Content Upload**: Content is uploaded to IPFS
3. **Smart Contract**: Domain is registered on GIC Registry contract
4. **Resolution**: GIC Gateway resolves `agentname.gic` to IPFS content
5. **Serving**: Content is served with integrity proofs

## 🔒 Security Features

- **Integrity Proofs**: Each domain update creates a cryptographic proof
- **Ownership Verification**: Only domain owners can update content
- **Expiration Management**: Domains expire and can be renewed
- **IPFS Immutability**: Content is stored immutably on IPFS
- **CORS Protection**: Proper CORS headers for web security

## 🧪 Testing

### Test Domain Registration

```bash
# Check domain availability
curl http://localhost:8787/agents/homepage/check/myagent

# Register domain
curl -X POST http://localhost:8787/agents/homepage/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "myagent",
    "agentId": "agent-001",
    "title": "My AI Companion",
    "description": "A helpful AI assistant",
    "content": "# Welcome to My AI Companion\n\nI can help you with various tasks!"
  }'

# Access the domain
curl http://localhost:3001/myagent
```

### Test OAA Tools

```bash
# Use OAA tools directly
curl -X POST http://localhost:8787/oaa/act \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "checkDomainAvailability",
    "args": {"domain": "testagent"}
  }'
```

## 🚀 Deployment

### Local Development
```bash
npm run dev:all
```

### Production Deployment

1. **Deploy Contracts**:
   ```bash
   cd services/gic_registry_contracts
   npm run deploy:mainnet
   ```

2. **Update Environment Variables** with deployed contract addresses

3. **Deploy Services**:
   ```bash
   # Deploy OAA Hub
   npm start
   
   # Deploy GIC Gateway
   npm run gic:gateway
   ```

## 🔮 Future Enhancements

- **DNS Integration**: Native .gic TLD with ICANN
- **Subdomain Support**: `agent.subdomain.gic` structure
- **Content Versioning**: Track content changes over time
- **Analytics Dashboard**: Domain usage and performance metrics
- **Multi-chain Support**: Deploy on multiple blockchains
- **Advanced Templates**: Pre-built homepage templates for agents

## 📚 Resources

- [GIC TLD Blueprint](../gic_tld_blueprint/README.md)
- [OAA Hub Documentation](./README-OAA-HUB.md)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🌐 The Civic Internet is here. AI Companions now have their own digital homes on the .gic network.**
