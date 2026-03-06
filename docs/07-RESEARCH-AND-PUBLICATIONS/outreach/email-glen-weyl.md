# Email Outreach: Glen Weyl

**Subject**: Mechanism design critique request: Integrity-gated token economics for AI governance

---

Dear Glen,

I'm reaching out to request your expertise on a mechanism design problem we've been working on at Mobius Systems.

**The Core Challenge**:  
How do you create economic incentives for AI systems to improve while staying aligned with human norms?

**Our Approach**:  
We've formalized an "Intention Compiler" that maps human intent through AI deliberation to cryptographically-attested integrity scores, then gates token issuance on those scores.

The MIC (Mobius Integrity Credits) reward function is:

```
R(x) = κ · (GI(x) - τ_min) · ω(x)  if GI(x) ≥ τ_min
     = 0                            otherwise
```

Where:
- GI(x) = Global Integrity score (0-1), computed by 7 AI Sentinels
- τ_min = Constitutional threshold (0.95)
- ω(x) = Contribution weight (effort, scarcity, impact)

**Why Your Work Matters Here**:

Your liberal radicalism framework (with Vitalik & Zoe) directly inspired our approach:
- Quadratic funding → Quadratic attestation (Sentinels vote on contributions)
- Capital-constrained matching → Integrity-constrained issuance
- Anti-plutocratic voting → Anti-Sybil cryptographic binding

**What We're Uncertain About**:

1. **Collusion Resistance**: How robust is our 4-of-7 Sentinel threshold against coordinated attacks?
2. **Dynamic Inflation**: Should token emission rates respond to system entropy?
3. **Trust Quantification**: How do we measure "community trust restored" as a monetary value?

**Attachments**:
- Briefing Dossier (1 page overview)
- Mathematical Formalization (8 pages)
- MIC Tokenomics Whitepaper (draft, 20 pages)
- KTT Trial-001 Empirical Results (pending Dec 2025)

**Not Asking For**:
- Money, endorsement, affiliation
- Just: Intellectual critique from someone who's thought deeply about mechanism design

**What Mobius Actually Is**:

Infrastructure for AI governance—not AGI itself. We're building the institutions that could safely welcome superintelligence, applying your Radical Markets ideas to artificial agents instead of human markets.

Would you be willing to critique our mechanism design? Even a 30-minute conversation would be invaluable.

Best,  
Michael Judan  
Founder & Custodian, Mobius Systems  
https://github.com/kaizencycle/Mobius-Substrate  

---

**Attachments**:
1. `BRIEFING_DOSSIER.md`
2. `intention-compiler-formalization.md`
3. `01_MIC_SPEC.md`
