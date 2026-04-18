# @mobius/mobius-sdk

Minimal **fetch** client for Mobius Gateway (`/v1/inference`, `/v1/providers`).

```bash
npm run build --workspace=@mobius/mobius-sdk
```

```ts
import { MobiusClient } from '@mobius/mobius-sdk';

const client = new MobiusClient({
  baseUrl: 'http://localhost:4050',
  token: process.env.MOBIUS_GATEWAY_BEARER,
});
```
