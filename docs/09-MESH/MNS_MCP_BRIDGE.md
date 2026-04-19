# Mobius MCP Bridge — Doctrine (C-286)

## What it is

Every repo in the **Mobius Neural Substrate (MNS)** that declares `mesh.mcp.enabled: true` in `mobius.yaml` is simultaneously:

1. A **mesh node** — identity, covenant, ledger feed, MII posture (see [MNS Protocol](./MNS_PROTOCOL.md)).
2. An **MCP server manifest** — tools, transport, base URL, and integrity rules that AI clients can consume without repo-specific guesswork.
3. An **integrity-governed capability surface** — when the runtime implements the bridge, tool invocations should be attributable, GI-gated where declared, and written to the civic ledger / EPICON feed according to policy.

## Why this matters

Without a declared MCP surface, agents call HTTP helpers ad hoc. There is no shared schema for **which** tools exist, **who** may invoke them, or **what** ledger record should exist afterward.

With `mesh.mcp`, the same file that registers the node in the mesh also describes the MCP contract. Discovery is centralized in:

- `mesh/mcp-discovery.json` — mesh-wide index (regenerated in CI).
- `.well-known/mcp.json` — stable well-known pointer at the Substrate root (raw GitHub URL for agents that only know the cortex).

## Signal flow (target architecture)

```text
AI agent (Cursor, Claude, Codex, …)
    |
    | fetch .well-known/mcp.json or mesh/mcp-discovery.json
    v
POST {node}/api/mcp  (streamable HTTP MCP)
    |
    | handler enforces mesh.mcp.integrity + per-tool requires_gi_above
    v
Tool implementation (reads/writes KV, proxied HTTP, …)
    |
    v
Optional: logInvocation → EPICON / civic feed (when log_all_invocations: true)
```

**Runtime implementation** for the Mobius Civic AI Terminal belongs in the **mobius-civic-ai-terminal** repository (`app/api/mcp/route.ts` or equivalent). This Substrate repo carries the **spec, discovery JSON, and CI** that make the mesh legible.

## Constitutional constraints (normative intent)

- **Read tools:** may default to no GI floor; still log when `log_all_invocations: true`.
- **Write tools:** declare `requires_gi_above` (for example `0.6`) where ledger mutation is involved.
- **Governance / Seal-class tools:** reserve higher gates in future EPICON; document them in `mobius.yaml` before enabling.

## Adding MCP to a new repo

1. Extend `mobius.yaml` with `mesh.mcp` (see `mesh/mobius-yaml-spec.md`).
2. Implement the MCP HTTP route in that repo’s stack (Terminal: Next.js route handlers).
3. Register the node in `mesh/registry.json` if not already listed.
4. Let the hourly Substrate workflow refresh `mesh/mcp-discovery.json` and `.well-known/mcp.json`, or open a PR that runs `node scripts/mesh-mcp-discovery.mjs` locally and commits the outputs.

## One-line canon

**The tools do not only run — they declare how they may run.**

---

*See also:* [MNS Protocol v1](./MNS_PROTOCOL.md), `mesh/mobius-yaml-spec.md`, `mesh/mcp-discovery.json`.

*We heal as we walk.*
