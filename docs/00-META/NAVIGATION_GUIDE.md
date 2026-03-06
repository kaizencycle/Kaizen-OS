---
doc_id: NAV-2025-001
title: "Navigation Guide"
category: "Meta-Documentation"
classification: 000
date: 2025-11-26
version: 1.0.0
status: published
keywords:
  - navigation
  - guide
  - documentation
  - finding
abstract: >
  Quick guide to navigating the Mobius Systems documentation. Learn how to find
  documents quickly using the classification system, indices, and search tools.
license: CC-BY-SA-4.0
---

# Navigation Guide
## How to Find What You Need in Mobius Systems Documentation

**Version**: 1.0.0  
**Last Updated**: 2025-11-26

---

## Quick Start

### New to Mobius?
👉 **Start Here**: [01-INTRODUCTION/00-START-HERE.md](../01-INTRODUCTION/00-START-HERE.md)

### Looking for Something Specific?
🔍 **Use the Master Index**: [MASTER_INDEX.md](./MASTER_INDEX.md)

### Browsing by Topic?
📚 **Use the Subject Index**: [SUBJECT_INDEX.md](./SUBJECT_INDEX.md)

---

## Navigation Methods

### 1. By Classification (Structure-Based)

Use the classification number to navigate directly:

```
000 - Want to understand the documentation system?
      → /docs/00-META/

100 - New user, need introduction?
      → /docs/01-INTRODUCTION/

200 - Interested in philosophy and theory?
      → /docs/02-THEORETICAL-FOUNDATIONS/

300 - Need governance and policy information?
      → /docs/03-GOVERNANCE-AND-POLICY/

400 - Looking for technical architecture?
      → /docs/04-TECHNICAL-ARCHITECTURE/

500 - Need implementation guides?
      → /docs/05-IMPLEMENTATION/

600 - Looking for operations procedures?
      → /docs/06-OPERATIONS/

700 - Want research and publications?
      → /docs/07-RESEARCH-AND-PUBLICATIONS/

800 - Need API or reference docs?
      → /docs/08-REFERENCE/

900 - Looking for supporting materials?
      → /docs/09-APPENDICES/ or /docs/10-ARCHIVES/
```

### 2. By Role (Purpose-Based)

#### I'm a New User
1. [START-HERE](../01-INTRODUCTION/00-START-HERE.md)
2. [Handbook](../01-INTRODUCTION/handbook/index.md)
3. [Quick Reference](../08-REFERENCE/quick-reference/)

#### I'm a Developer
1. [Technical Architecture](../04-TECHNICAL-ARCHITECTURE/)
2. [Implementation Guides](../05-IMPLEMENTATION/)
3. [API Reference](../08-REFERENCE/api/)

#### I'm a Researcher
1. [Whitepapers](../07-RESEARCH-AND-PUBLICATIONS/whitepapers/)
2. [Theoretical Foundations](../02-THEORETICAL-FOUNDATIONS/)
3. [Research Publications](../07-RESEARCH-AND-PUBLICATIONS/)

#### I'm an Operator
1. [Operations](../06-OPERATIONS/)
2. [Deployment Guides](../05-IMPLEMENTATION/guides/deployment/)
3. [Runbooks](../06-OPERATIONS/processes/runbooks/)

#### I'm Interested in Governance
1. [Governance Overview](../03-GOVERNANCE-AND-POLICY/governance/overview.md)
2. [Constitution](../03-GOVERNANCE-AND-POLICY/constitution/)
3. [Policy](../03-GOVERNANCE-AND-POLICY/policy/)

### 3. By Topic (Content-Based)

Use the [Subject Index](./SUBJECT_INDEX.md) to find all documents related to a topic.

**Example Topics**:
- **DVA** → See Subject Index under "D"
- **MIC Economics** → See Subject Index under "M"
- **Governance** → See Subject Index under "G"
- **APIs** → See Subject Index under "A"

### 4. By Document Name (Alphabetical)

Use the [Master Index - Alphabetical Section](./MASTER_INDEX.md#alphabetical-index) to find documents by name.

### 5. By Document ID (Citation-Based)

All major documents have a Doc ID (e.g., `WP-2025-001`).

Find documents by ID in the [Master Index](./MASTER_INDEX.md#document-index-by-classification).

---

## Search Strategies

### Strategy 1: Keyword Search
1. Open [Subject Index](./SUBJECT_INDEX.md)
2. Search (Ctrl+F / Cmd+F) for your keyword
3. Follow links to relevant documents

### Strategy 2: Browse by Category
1. Choose your classification (000-900)
2. Read category README
3. Navigate to specific documents

### Strategy 3: Cross-Reference Navigation
1. Start with a known document
2. Look for "See also" or "Related Documentation" sections
3. Follow cross-references to related content

### Strategy 4: Comprehensive Search
1. Start with [Master Index](./MASTER_INDEX.md)
2. Use browser search (Ctrl+F / Cmd+F)
3. Search by title, Doc ID, or topic

---

## Common Searches

### "Where is the MIC whitepaper?"
📄 **Answer**: [07-RESEARCH-AND-PUBLICATIONS/whitepapers/MIC_Whitepaper_v2.1.md](../07-RESEARCH-AND-PUBLICATIONS/whitepapers/MIC_Whitepaper_v2.1.md)  
**Doc ID**: WP-2025-001

### "How do I deploy Mobius?"
🚀 **Answer**: [05-IMPLEMENTATION/guides/deployment/DEPLOYMENT_GUIDE.md](../05-IMPLEMENTATION/guides/deployment/DEPLOYMENT_GUIDE.md)  
**Doc ID**: DEPLOY-2025-001

### "What is DVA?"
🔐 **Answer**: [04-TECHNICAL-ARCHITECTURE/dva/](../04-TECHNICAL-ARCHITECTURE/dva/)  
**Doc ID**: DVA-2025-001

### "How is Mobius governed?"
🏛️ **Answer**: [03-GOVERNANCE-AND-POLICY/governance/overview.md](../03-GOVERNANCE-AND-POLICY/governance/overview.md)  
**Doc ID**: GOV-2025-001

### "Where are the API docs?"
🔌 **Answer**: [08-REFERENCE/api/](../08-REFERENCE/api/)  
**Doc ID**: API-2025-001

---

## Tips & Tricks

### Tip 1: Use README Files
Every major category has a README with:
- Overview of the category
- Contents and structure
- Key documents highlighted
- Cross-references

**Always start with the README** when exploring a new category.

### Tip 2: Follow the Trail
Documents include cross-references like:
- "See also: → [Other Topic]"
- "Related Documentation:"
- "For more details, see [@DOC-ID]"

**Follow these links** to discover related content.

### Tip 3: Bookmark Key Pages
Create bookmarks for frequently used pages:
- Master Index
- Your role's starting point
- Favorite documents

### Tip 4: Use Doc IDs for Citations
When citing or referencing:
- Use the Doc ID (e.g., `WP-2025-001`)
- Provides stable reference even if file moves
- Makes collaboration easier

### Tip 5: Check Last Updated
Documents show **Last Updated** date in frontmatter.
- Ensures you're reading current information
- Helps track document freshness

---

## Document Hierarchy

### Understanding the Structure

```
Category (00-10)
  └─ Subcategory
      └─ Topic Area
          └─ Individual Documents
```

**Example**:
```
04-TECHNICAL-ARCHITECTURE/      (Category)
  └─ dva/                       (Subcategory)
      └─ DVA_MEMT_INTEGRATION.md (Document)
```

### Maximum Depth: 3 Levels
- Never more than 3 clicks to reach a document
- Ensures fast navigation
- Reduces cognitive load

---

## Mobile & Offline

### Mobile Navigation
- Use table of contents in long documents
- Bookmark key pages
- Master Index works well on mobile

### Offline Access
- Clone the repository for offline access
- All documentation is in markdown (readable offline)
- No external dependencies for core docs

---

## Need Help?

### Can't Find What You Need?
1. Check [Master Index](./MASTER_INDEX.md) - most comprehensive
2. Try [Subject Index](./SUBJECT_INDEX.md) - topic-based
3. Search GitHub repository
4. Ask in [GitHub Discussions](https://github.com/kaizencycle/Mobius-Substrate/discussions)

### Found a Broken Link?
- Report it: [GitHub Issues](https://github.com/kaizencycle/Mobius-Substrate/issues)
- Label: "documentation"

### Want to Improve Documentation?
- See: [Contributing Guide](../../CONTRIBUTING.md)
- See: [Documentation Maintenance](./MAINTENANCE.md) *(to be created)*

---

## Quick Reference Card

| I Want To... | Go To... |
|--------------|----------|
| Get started | [START-HERE](../01-INTRODUCTION/00-START-HERE.md) |
| Find any document | [Master Index](./MASTER_INDEX.md) |
| Browse by topic | [Subject Index](./SUBJECT_INDEX.md) |
| Learn architecture | [Technical Architecture](../04-TECHNICAL-ARCHITECTURE/) |
| Deploy system | [Deployment Guides](../05-IMPLEMENTATION/guides/deployment/) |
| Understand economics | [MIC Whitepaper](../07-RESEARCH-AND-PUBLICATIONS/whitepapers/MIC_Whitepaper_v2.1.md) |
| Read governance | [Governance Overview](../03-GOVERNANCE-AND-POLICY/governance/overview.md) |
| Access APIs | [API Reference](../08-REFERENCE/api/) |
| Find runbooks | [Operations](../06-OPERATIONS/) |
| Read research | [Research & Publications](../07-RESEARCH-AND-PUBLICATIONS/) |

---

## Version Information

- **Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Next Review**: 2025-12-26
- **Status**: Published

---

**Classification**: 000 - Meta-Documentation  
**Status**: Published  
**License**: CC-BY-SA-4.0  
**Document ID**: NAV-2025-001

*"Good documentation is invisible infrastructure. You shouldn't need to think about navigation—you should just find what you need."*
