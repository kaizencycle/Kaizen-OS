# @mobius/mec-parser

Reference implementation for **Mobius Extraction Code (MEC)** — constitutional
citation shorthand (C-365).

Spec: [`specs/MEC_SPEC_v0.1.md`](../../specs/MEC_SPEC_v0.1.md)

## Usage

```typescript
import { parseMEC, formatMEC, toSealCode } from '@mobius/mec-parser';

const parsed = parseMEC('E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064');
console.log(parsed.gi); // 0.64
console.log(formatMEC(parsed)); // round-trip canonical string
console.log(toSealCode(parsed)); // operator card display
```

Terminal, HIVE, and CPC should import from this package — do not fork the regex.

## Build

```bash
npm run build --workspace=@mobius/mec-parser
```
