# @mobius/mec-parser

Reference implementation for **Mobius Extraction Code (MEC)** — constitutional
citation shorthand (C-365).

Spec: [`specs/MEC_SPEC_v0.1.md`](../../specs/MEC_SPEC_v0.1.md)

## Usage

```typescript
import { parseMec, formatMec, formatSealCode } from '@mobius/mec-parser';

const parsed = parseMec('E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064');
if (parsed.ok) {
  console.log(parsed.value.gi); // 0.64
  console.log(formatMec(parsed.value)); // round-trip canonical string
  console.log(formatSealCode(parsed.value)); // operator card display
}
```

Terminal, HIVE, and CPC should import from this package — do not fork the regex.

## Build

```bash
npm run build --workspace=@mobius/mec-parser
```
