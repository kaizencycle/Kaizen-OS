# Mobius Landing — Design Rationale (C-377)

**Cycle:** C-377  
**Surface:** `apps/mobius-landing` · `mobius-substrate.com` apex  
**Direction:** Ledger Folio — dark vestibule into a lit paper reading room

---

## Values invoked

**Integrity.** The page describes a system that remembers why. Its visual language should read as durable record-keeping, not campaign marketing.

**Custodianship.** Civilians arrive first. Type, contrast, and section rhythm must privilege reading over persuasion.

**Observability.** Constitutional lines ("Canon → Ledger → UI", "No UI-derived truth", HIVE sandbox framing) are rendered as first-class content, not footnotes.

---

## Reasoning

C-376 (#402) established journey-first information architecture. The prior layout was structurally correct but visually adjacent to an unstyled default: zinc Tailwind tokens, rounded cards, emerald growth-metric accents, and an ASCII architecture block.

This pass introduces a documented token layer (`app/globals.css`) and IBM Plex type roles (wired in `app/layout.tsx`) to align the apex with sibling protocol surfaces — especially `epicon.mobius-substrate.com` — while remaining warmer and more inviting than a legal document.

**Palette.** Six named colors: `--m-ink-deep`, `--m-ink`, `--m-paper`, `--m-paper-ink`, `--m-seal`, `--m-ink-muted`. Derived tints (`--m-seal-soft`, `--m-rule`, etc.) support hairlines and hover without expanding the palette arbitrarily. Seal green (`#2d5a3d`) is stamp-ink green, not dashboard emerald.

**Type.** IBM Plex Serif (display), Sans (body), Mono (labels, loop, figure captions). Same family as EPICON; different temperature via paper ground.

**Spacing.** 4px base scale (`--m-space-*`). `--m-radius: 0` is a stated convention — constitutional surfaces use square corners.

**Signature element.** FIG. 1 — THE CHAIN OF MEMORY replaces the ASCII `<pre>` block. Caption: *meaning flows up, truth flows down*. Close line: *No UI-derived truth. Canon → Ledger → UI.* This is the one place boldness is spent. The Mobius loop remains a disciplined horizontal strip (CSS only, `prefers-reduced-motion` respected) — sequence treatment is earned there because the loop is a real ordered process.

---

## Deliberate omissions

- **No möbius-band illustration.** Considered for the loop section; rejected as competing decoration against FIG. 1. One signature risk per brief.
- **No coin iconography, progress bars, or collectible affordances** on the MFS section — quietest register on the page.
- **No stock gradients, fake social proof, or engagement-bait patterns.**
- **No new runtime dependencies.** Tokens and fonts use Next.js built-ins only.
- **No copy changes** to constitutional framing lines. HIVE card CTA reads "Read how HIVE works" (honest interim; destination unchanged per C-376 P2 note).

---

## Counterfactual

If the design regresses no-JS readability, accessibility (WCAG AA / Lighthouse a11y), or constitutional line presence, revert layout to `13229f6f` structure and retain tokens only. If EPICON Guard flags scope, adopt the Guard's auto-generated scope line from the file→scope registry.

---

## Adoption path

Sibling surfaces may import `--m-*` variables from `globals.css` or mirror the token block. Kinship is via tokens and Plex roles, not duplicated components.

*Report discloses; repo witnesses.*
