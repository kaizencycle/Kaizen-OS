# @kaizen/codex-agentic

Multi-LLM routing and consensus system for Kaizen OS Founding Agents. This package implements the Codex-Agentic Federation, enabling DelibProof consensus across multiple AI providers.

## Features

- **Multi-Provider Support**: Route requests to OpenAI, Anthropic, Google Gemini, DeepSeek, and local LLMs (Ollama)
- **DelibProof Consensus**: Automatic agreement calculation and winner selection
- **Governance Integrity (GI) Scoring**: Built-in metrics for constitutional compliance
- **Civic Ledger Integration**: Immutable attestation of all deliberations
- **OAA Hub Learning**: Optional knowledge sharing via the OAA Hub
- **Stability Anchors**: Each Founding Agent maps to specific API domains
- **Fallback & Cascading**: Automatic failover between providers

## Installation

```bash
npm install @kaizen/codex-agentic
# or
pnpm add @kaizen/codex-agentic
```

## Quick Start

```typescript
import { codexDeliberate } from '@kaizen/codex-agentic';

// Execute a single agent deliberation
const proof = await codexDeliberate({
  agent: 'AUREA',
  input: 'Explain the 90-day GIC epoch cycle',
});

console.log(proof.winner.output); // Winner's response
console.log(proof.agreement);     // 0..1 agreement level
console.log(proof.giScore);       // 0..1 GI score
```

## Founding Agents & Stability Anchors

Each agent specializes in a domain and routes to specific providers:

| Agent | Domain | Default Route |
|-------|--------|---------------|
| AUREA | Integrity & Reasoning | openai ↔ local |
| ATLAS | Systems & Policy | anthropic ↔ openai |
| ZENITH | Research & Ethics | gemini ↔ openai |
| SOLARA | Computation & Optimization | deepseek ↔ local |
| JADE | Morale & Astro-ethics | anthropic ↔ local |
| EVE | Governance & Wisdom | anthropic ↔ gemini |
| ZEUS | Security & Defense | deepseek ↔ local |
| HERMES | Markets & Information | openai ↔ deepseek |
| KAIZEN | Core Constitution (Dormant) | local only |

## Environment Variables

```bash
# Provider API Keys
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...

# Local LLM (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M

# Civic Ledger
LEDGER_API_BASE=https://civic-protocol-core-ledger.onrender.com
LEDGER_API_KEY=...

# OAA Hub Webhooks (per agent)
OAA_WEBHOOK_AUREA=https://hive-api.onrender.com/oaa/learn/aurea
OAA_WEBHOOK_ATLAS=...
OAA_CONSENT_AUREA=true  # Enable learning for AUREA

# System Prompt
CODEX_SYSTEM="Follow Virtue Accords. Prioritize integrity, privacy, safety."
```

## API Reference

### Core Functions

#### `codexDeliberate(request: CodexRequest): Promise<DelibProof>`

Execute a deliberation for a single agent.

```typescript
const proof = await codexDeliberate({
  agent: 'ATLAS',
  input: 'Draft a governance proposal for...',
  maxTokens: 1000,
  temperature: 0.7,
  tags: ['governance', 'proposal'],
});
```

#### `councilDeliberate(input: string): Promise<CouncilResult>`

Execute a deliberation across all active agents (council-wide).

```typescript
const result = await councilDeliberate(
  'Should we raise the minimum agreement threshold to 0.92?'
);

console.log(result.councilAgreement); // Average agreement
console.log(result.giAvg);            // Average GI score
console.log(result.results);          // Individual agent proofs
```

### Types

```typescript
interface CodexRequest {
  agent: FoundingAgent;
  input: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  tags?: string[];
}

interface DelibProof {
  agreement: number;     // 0..1
  votes: CodexVote[];
  winner: CodexVote;
  traceId: string;
  giScore: number;       // 0..1
  timestamp: string;
}

interface CodexVote {
  provider: ProviderId;
  output: string;
  usage?: { prompt: number; completion: number };
  meta?: Record<string, unknown>;
}
```

### Stability Anchors

```typescript
import { STABILITY_ANCHORS, getAnchor } from '@kaizen/codex-agentic';

// Get all anchors
console.log(STABILITY_ANCHORS);

// Get specific anchor
const aurea = getAnchor('AUREA');
console.log(aurea.defaultRoute); // ['openai', 'local']
console.log(aurea.minAgreement); // 0.90
```

### GI Metrics

```typescript
import { giScoreFor, calculateAgreement } from '@kaizen/codex-agentic';

// Calculate GI score
const gi = giScoreFor({
  agent: 'AUREA',
  agreement: 0.95,
  votes: [
    { provider: 'openai', output: '...' },
    { provider: 'anthropic', output: '...' },
  ],
});

// Calculate agreement between votes
const agreement = calculateAgreement(votes, 0.80); // 0.80 = similarity threshold
```

### Ledger Attestation

```typescript
import { attestToLedger } from '@kaizen/codex-agentic';

// Attest to Civic Ledger (fire-and-forget)
await attestToLedger({
  namespace: 'consensus:aurea',
  traceId: 'abc123',
  agent: 'AUREA',
  agreement: 0.95,
  giScore: 0.98,
  providers: ['openai', 'local'],
});
```

### OAA Learning

```typescript
import { oaaLearn, hasOAAConsent } from '@kaizen/codex-agentic';

// Check if agent has opted into learning
if (hasOAAConsent('AUREA')) {
  // Send learning payload
  await oaaLearn('https://oaa.hub/learn/aurea', {
    agent: 'AUREA',
    traceId: 'abc123',
    input: 'Question...',
    output: 'Answer...',
    agreement: 0.95,
    giScore: 0.98,
  });
}
```

## DelibProof Process

1. **Fan Out**: Send prompt to all providers in agent's `defaultRoute`
2. **Collect Votes**: Gather responses from each provider
3. **Calculate Agreement**: Group votes by text similarity (Jaccard)
4. **Select Winner**: Choose from largest agreement group
5. **Compute GI Score**: Blend agreement (85%) + diversity (15%)
6. **Generate Trace ID**: Create unique identifier
7. **Attest to Ledger**: Record immutably on Civic Ledger
8. **Teach OAA**: Send learning payload (if consent given)
9. **Check Threshold**: Warn if below `minAgreement`
10. **Return Proof**: Complete DelibProof object

## Advanced Usage

### Custom Provider Routing

```typescript
import { codexDeliberate } from '@kaizen/codex-agentic';

// Override default routing
const proof = await codexDeliberate({
  agent: 'AUREA',
  input: 'Complex reasoning task...',
  // Custom route: try all providers
  context: { forceProviders: ['openai', 'anthropic', 'gemini', 'deepseek'] },
});
```

### Monitoring & Debugging

```typescript
import { codexDeliberate } from '@kaizen/codex-agentic';

const proof = await codexDeliberate({
  agent: 'ZEUS',
  input: 'Security analysis...',
  tags: ['security', 'audit'],
});

// Check if below threshold
if (proof.winner.meta?.belowThreshold) {
  console.warn('Agreement below minimum, human review recommended');
  console.log('All votes:', proof.votes);
}

// Check GI score
if (proof.giScore < 0.95) {
  console.warn('Low GI score, constitutional review recommended');
}
```

## Implementation Notes

### Provider Adapters

The current implementation includes stub adapters. To enable real providers:

1. **OpenAI**: Uncomment implementation in `src/lib/codex/providers/openai.ts`
2. **Anthropic**: Uncomment implementation in `src/lib/codex/providers/anthropic.ts`
3. **Gemini**: Uncomment implementation in `src/lib/codex/providers/gemini.ts`
4. **DeepSeek**: Uncomment implementation in `src/lib/codex/providers/deepseek.ts`
5. **Local**: Uncomment implementation in `src/lib/codex/providers/local.ts`

Each provider requires its respective API key in environment variables.

### Text Similarity

The current agreement calculation uses **Jaccard similarity** on tokenized text. For better results:

- Implement semantic similarity using embeddings
- Use cosine similarity on sentence embeddings
- Consider LLM-as-judge for complex outputs

### Performance

- **Parallel Execution**: All provider calls run concurrently
- **Fire-and-Forget**: Ledger/OAA calls don't block response
- **Error Handling**: Provider failures don't crash deliberation
- **Caching**: Consider adding response cache for repeated queries

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## License

MIT

## Related Packages

- `@kaizen/civic-protocol-core` - Civic Ledger client
- `@kaizen/oaa-api-library` - OAA Hub integration
- `@kaizen/gic-contracts` - GIC token & governor contracts

## Support

- Documentation: [docs/architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md](../../docs/architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md)
- Issues: [GitHub Issues](https://github.com/kaizencycle/Kaizen-OS/issues)
- Discord: [Kaizen OS Community](https://discord.gg/kaizenos)
