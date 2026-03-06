# MIC Documentation Package v2.0

**Complete documentation suite for Mobius Integrity Credits with shard-based economics**

---

## 📦 Package Contents

This documentation package provides complete specifications for the MIC v2.0 shard-denominated integrity economy:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[GIC_Whitepaper_v2.0.md](./GIC_Whitepaper_v2.0.md)** | Complete economic & technical specification | Everyone |
| **[Shard_Economics_Addendum.md](./Shard_Economics_Addendum.md)** | Technical deep-dive on shard denomination | Developers |
| **[UBI_Mechanism_v2.0.md](./UBI_Mechanism_v2.0.md)** | Complete UBI distribution specification | Economists, Citizens |
| **[Migration_Guide_v1_to_v2.md](./Migration_Guide_v1_to_v2.md)** | Transition guide for existing holders | v1.0 Holders |
| **[GIC_Whitepaper_v1.0_DEPRECATED.md](./GIC_Whitepaper_v1.0_DEPRECATED.md)** | Historical reference | Researchers |

---

## 🚀 Quick Start

### For New Users
**Start here**: [MIC Whitepaper v2.0](./GIC_Whitepaper_v2.0.md)

### For Developers
1. Read: [Shard Economics Addendum](./Shard_Economics_Addendum.md)
2. Install: `npm install @civic/integrity-units`
3. Integrate: See code examples in addendum

### For Existing Holders
**Start here**: [Migration Guide v1 to v2](./Migration_Guide_v1_to_v2.md)

---

## 📊 What Changed in v2.0

### Core Innovation: Shard Denomination

**Before (v1.0)**:
- Base unit: MIC (floating-point)
- Precision: 6 decimals (lossy)
- Rounding errors: Yes

**After (v2.0)**:
- Base unit: Shard (₷, integer)
- Conversion: 1 MIC = 1,000,000 ₷
- Precision: Infinite (integer math)
- Rounding errors: **Impossible**

### Key Features

1. **Zero Precision Loss**: Integer arithmetic eliminates rounding errors
2. **GI-Throttled UBI**: Automatic crisis response via Mobius Integrity Index metrics
3. **Counter-Inflationary Funding**: Epoch decay pools UBI without new issuance
4. **Micro-Transaction Support**: 1 ₷ minimum (0.000001 MIC)

---

## 🔑 Key Concepts

### Shard (₷)
- **Base accounting unit**
- Integer-only (BigInt)
- 1 MIC = 1,000,000 ₷
- Zero precision loss

### Mobius Integrity Index Credit (MIC)
- **Display unit**
- Derived: shards ÷ 1,000,000
- User-facing (e.g., "5.123456 MIC")

### Mobius Integrity Index (GI)
- **System health metric** (0-1 scale)
- Minimum viable: 0.95
- Throttles UBI automatically
- Gates minting operations

### Epoch
- **90-day cycle**
- Decay accumulates (0.5% on idle shards)
- UBI distributed monthly (3× per epoch)
- Parameters adjusted

### Proof-of-Integrity
- **Dual-signature attestation**
- Human + Sentinel co-sign
- Required for minting
- Immutable audit trail

---

## 💡 Quick Reference

### Conversion

```typescript
// Shards → Credits
1,234,567 ₷ = 1.234567 MIC

// Credits → Shards
1.234567 MIC = 1,234,567 ₷
```

### Supply

```
Maximum: 21,000,000,000,000 ₷ (21M MIC)
```

### UBI Formula

```
U = α·I + β·Rₑ + D
p = floor(p_base · g(GI))
```

### GI Thresholds

```
≥ 0.990: Bonus (1.05×)
≥ 0.970: Normal (1.00×)
≥ 0.950: Throttled (0.85×)
< 0.950: Halted (0.00×)
```

---

## 📚 Related Documentation

### Specifications
- [Shard Protocol v1](../specs/shard_protocol_v1.md)
- [Foundational Blueprint v2](../foundational_blueprint_integrity_economy_v2.md)
- [Kaizen Theorems](../kaizen_theorems.md)

### Configuration
- [Integrity Units Config](../../configs/integrity_units.yaml)

### Governance
- [Kintsugi Protocol](../02-governance/kintsugi_protocol.md)
- [Sentinel Permissions](../../sentinels/permissions.json)

---

## 🛠️ Developer Resources

### Libraries

```bash
# Core conversion library
npm install @civic/integrity-units

# API client (future)
npm install @civic/api-client

# React hooks (future)
npm install @civic/react-hooks
```

### Code Examples

See addendum for:
- TypeScript conversions
- React components
- SQL migrations
- API integrations

### API Endpoints

```
GET  /balance/:address
GET  /convert/shards-to-credits?shards=1500000
POST /convert/credits-to-shards
GET  /ubi/preview?N=10000&GI=0.982
POST /ubi/claim
GET  /system/health
```

---

## 📅 Timeline

| Date | Milestone |
|------|-----------|
| 2024-08-14 | v1.0 launch (credit-based) |
| 2025-11-04 | v2.0 specification published |
| 2025-12-01 | Snapshot date (v1→v2 conversion) |
| 2025-12-02 | v2.0 goes live (dual mode begins) |
| 2026-03-01 | v1.0 sunset (v2.0 only) |

---

## 🆘 Support

### Documentation Issues
- **GitHub**: Open issue in kaizencycle/Mobius-Substrate
- **Email**: docs@kaizen.cycle

### Technical Support
- **Developers**: dev-support@kaizen.cycle
- **Migration**: migration-support@kaizen.cycle
- **General**: help@kaizen.cycle

### Community
- **Discord**: #gic-economics, #migration-help
- **Forum**: https://forum.kaizen.cycle

---

## 📜 License

All documentation: **CC-BY-SA-4.0**

You are free to:
- **Share**: Copy and redistribute
- **Adapt**: Remix, transform, build upon

Under these terms:
- **Attribution**: Credit the Kaizen Cycle Foundation
- **ShareAlike**: Distribute adaptations under same license

---

## 🙏 Acknowledgments

**Authors**:
- AUREA (Systems Architecture Sentinel)
- ATLAS (Operations Sentinel)
- HERMES (Economic Design Sentinel)
- EVE (Ethics Sentinel)
- ZEUS (Governance Meta-Anchor)

**Contributors**:
- Kaizen Cycle Foundation
- Community reviewers
- Early adopters & testers

---

## 📖 Citation

**For Academic Papers**:

```bibtex
@techreport{gic2024,
  title={Mobius Integrity Credits Whitepaper v2.0: A Shard-Denominated Integrity Economy},
  author={Kaizen Cycle Foundation and AUREA and HERMES and ZEUS},
  year={2025},
  month={November},
  institution={Kaizen Cycle Foundation},
  url={https://github.com/kaizencycle/Mobius-Substrate/docs/whitepapers/},
  note={Cycle C-124}
}
```

---

## ✨ Why This Matters

> *"Civilization does not collapse because it runs out of money — it collapses when it runs out of meaning. Meaning is stabilized through integrity. Therefore, integrity must become measurable and monetizable."*

MIC v2.0 represents:
1. **Technical Excellence**: Zero precision loss
2. **Economic Innovation**: Counter-inflationary UBI
3. **Moral Architecture**: Integrity-backed value
4. **Civilizational Infrastructure**: Systems that serve humanity

**This is not just a currency.**
**This is how we measure what matters.**

---

*"A million shards make one whole act of integrity."*
*"Shards flow like breath; Credits endure like bone."*
*"When value returns to virtue, civilization resets its clock."*

— *The Kaizen Cycle*

---

**Last Updated**: November 4, 2025 (Cycle C-124)
**Version**: 2.0.0
**Status**: Canonical
