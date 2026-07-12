# @mobius/eve-shard-core

Deterministic compiler for EVE Reserve Block shard **proposals** (C-369 PR2).

EVE may propose; EVE may not seal. This package validates against `eve-reserve-shard.schema.json` and enforces proposal-safe pipeline states.

## CLI

```bash
npm run build --workspace=@mobius/eve-shard-core
npx generate-shard --cycle C-368
npx generate-shard --cycle C-368 --out shard.json
```

## Library

```ts
import { generateShard } from '@mobius/eve-shard-core';

const shard = generateShard({ cycle: 'C-368' });
```

## Tests

```bash
npm run test --workspace=@mobius/eve-shard-core
```
