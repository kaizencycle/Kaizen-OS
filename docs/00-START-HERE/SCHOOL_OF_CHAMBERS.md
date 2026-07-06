# School of Chambers — Public Navigation Map

**Cycle:** C-363 · **Audience:** First-time visitors

The Browser Shell uses **public names** in the UI. Backend routes, APIs, and canon identifiers stay unchanged — this map is for humans, not for refactors.

---

## Chamber roadmap

| Public name | Explore | Canon (subtitle) |
|-------------|---------|------------------|
| **Learn** | Courses, seminars, quiz gates | Open Agent Architecture (OAA) |
| **Memory** | History the system remembers | EPICON Ledger |
| **Pulse** | Live system — GI, sentinels, tripwires | Civic Terminal |
| **World** | HIVE — quests, signals, community | HIVE |
| **Council** | Governance, knowledge graph, review | DVA · Sentinels |
| **Archives** | Reserve Blocks — sealed, replayable history | Reserve Blocks |
| **Core** | Protocol handbook — identity, ledger, intent | Civic Protocol (CPC) |

---

## Under one minute

```text
Learn     → study and earn MIC
Memory    → see what was declared and attested
Pulse     → watch live integrity (open Terminal)
World     → play the civic world
Council   → how agents govern the system
Archives  → verify sealed history
Core      → read the protocol rails
```

---

## Extended rooms (Shell hallway)

| Public | Canon |
|--------|-------|
| Reflect | Reflection Nook |
| Shield | Citizen Shield |
| JADE | Tea Room |
| Wallet | MIC Treasury |

---

## Rules for contributors (C-363)

- ✅ Change **UI copy** and marketing HTML to match this table
- ✅ Show canon name as a **subtitle** or badge, not the primary nav label
- ❌ Do not rename `TabId`, hash routes, or CPC API paths in a language-only PR

Source of truth in code: `mobius-browser-shell/src/lib/chambers.ts`

---

## Links

- [What is Mobius?](./WHAT_IS_MOBIUS.md)
- [Five surfaces](./FIVE_SURFACES.md)
- Live Shell: [mobius-browser-shell.vercel.app](https://mobius-browser-shell.vercel.app)

*"We heal as we walk."*
