# mobius-browser-shell — C-274 flywheel export

This folder mirrors the **C-274 Browser Shell flywheel wiring** for handoff when the integration token cannot push to `kaizencycle/mobius-browser-shell`.

## Apply to the Shell repo

From a clone of [mobius-browser-shell](https://github.com/kaizencycle/mobius-browser-shell) on `main`:

```bash
git checkout -b cursor/c274-shell-flywheel-wire
git am /path/to/Mobius-Substrate/docs/pr-bundles/mobius-browser-shell-c274/C274-flywheel.patch
# or copy files from this directory over the repo root (same paths as upstream)
npm ci && npm run lint && npm run build
git push -u origin cursor/c274-shell-flywheel-wire
```

## Contents

| Path | Role |
|------|------|
| `App.tsx` | GI chip + polling + world strip + mobile GI link |
| `components/WorldSignalStrip.tsx` | Six-domain signal line + Terminal link |
| `src/lib/terminal-bridge.ts` | `fetchTerminalState` (typed JSON parse, no `any`) |
| `src/lib/epicon-attest.ts` | `submitAttestation` → `POST /ledger/attest` |
| `C274-flywheel.patch` | Single-commit patch (`git am`) |

Branch tip in the working clone: `546a9ea` (message: `feat(flywheel): wire Shell → Terminal snapshot + Substrate EPICON path [C-274]`).
