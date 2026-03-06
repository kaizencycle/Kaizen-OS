# PhD Thesis Templates

**Purpose:** Complete dissertation frameworks for Mobius-related research  
**Audiences:** PhD candidates, doctoral advisors, academic institutions  

---

## Overview

These templates provide structured frameworks for doctoral dissertations exploring recursive intelligence, negentropic economics, and AI alignment. Each template includes chapter outlines, methodology guidance, and citation frameworks.

---

## Available Templates

### 1. PhD in AI Safety: Strange Metamorphosis Loop

**Path:** `phd-sml/`

**Focus:** Human-aligned recursive learning through daily reflection

**Suggested Titles:**
- "Bounded Meta-Learning Through Human Reflection: A Daily Protocol for AI Alignment"
- "The Strange Metamorphosis Loop: Preventing AI Drift Through Continuous Human Feedback"
- "From RLHF to SML: A Paradigm Shift in Human-AI Alignment"

**Chapter Outline:**
1. Introduction (15-20 pages)
2. Literature Review (40-50 pages)
3. Theoretical Framework (30-40 pages)
4. Methodology (25-35 pages)
5. Implementation (30-40 pages)
6. Experimental Results (40-50 pages)
7. Discussion (20-30 pages)
8. Conclusion (10-15 pages)

**Files:**
- `chapter-templates/` — LaTeX templates for each chapter
- `bibliography.bib` — Comprehensive bibliography
- `thesis-outline.md` — Detailed outline

---

### 2. PhD in Economics: Negentropic Economics

**Path:** `phd-negentropic-economics/`

**Focus:** Thermodynamics-economics unification and debt reduction

**Suggested Titles:**
- "Negentropic Economics: A Thermodynamic Theory of Institutional Debt"
- "Entropy, Interest, and Order: Unifying Physics and Economics"
- "Debt Reduction Through Negentropy: Theory and Empirical Validation"

**Chapter Outline:**
1. Introduction (15-20 pages)
2. Literature Review (50-60 pages)
3. Theoretical Framework (40-50 pages)
4. Mathematical Model (35-45 pages)
5. Empirical Methodology (25-35 pages)
6. Results and Validation (45-55 pages)
7. Policy Implications (25-35 pages)
8. Conclusion (10-15 pages)

**Files:**
- `chapter-templates/` — LaTeX templates for each chapter
- `data-appendix/` — Data sources and methodology
- `bibliography.bib` — Economics + physics bibliography

---

### 3. PhD in Computer Science: Mobius Cycle Protocol

**Path:** `phd-mcp/`

**Focus:** Operationally-enforced AI governance through integrity gates

**Suggested Titles:**
- "The Mobius Cycle Protocol: Systematic AI Safety Through Multi-Sentinel Consensus"
- "From Advisory to Enforceable: Cryptographic Attestation in AI Governance"
- "Multi-LLM Consensus for AI System Integrity: Design, Implementation, and Validation"

**Chapter Outline:**
1. Introduction (15-20 pages)
2. Background and Related Work (40-50 pages)
3. System Design (35-45 pages)
4. Implementation (40-50 pages)
5. Evaluation (45-55 pages)
6. Security Analysis (25-35 pages)
7. Discussion (20-30 pages)
8. Conclusion (10-15 pages)

---

### 4. PhD in Philosophy: Recursive Ethics

**Path:** `phd-ethics/`

**Focus:** Ethical foundations of self-improving AI systems

**Suggested Titles:**
- "The Kintsugi Principle: An Ethics of Visible Repair in AI Systems"
- "Recursive Ethics: When Machines Learn to Learn About Values"
- "Democratic Alignment: Public Participation in AI Value Formation"

**Chapter Outline:**
1. Introduction (15-20 pages)
2. Historical and Conceptual Background (50-60 pages)
3. The Alignment Problem (30-40 pages)
4. Recursive Ethics Framework (40-50 pages)
5. The Kintsugi Principle (30-40 pages)
6. Democratic Legitimacy (35-45 pages)
7. Applications and Implications (25-35 pages)
8. Conclusion (10-15 pages)

---

## Common Elements

### LaTeX Preamble

All templates use this common preamble:

```latex
\documentclass[12pt,a4paper,twoside]{report}

% Packages
\usepackage[utf8]{inputenc}
\usepackage{amsmath,amssymb,amsthm}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{algorithm}
\usepackage{algorithmic}
\usepackage{tikz}
\usepackage{booktabs}
\usepackage{natbib}

% Theorem environments
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{definition}{Definition}[chapter]

% Custom commands
\newcommand{\MII}{\text{MII}}
\newcommand{\GI}{\text{GI}}
\newcommand{\SML}{\text{SML}}
\newcommand{\MCP}{\text{MCP}}
```

### Bibliography Style

Recommended: `apalike` or `plainnat`

```latex
\bibliographystyle{apalike}
\bibliography{bibliography}
```

### Citation Guidelines

When citing Mobius Systems work:

```bibtex
@article{mobius2025sml,
  title={Human-Guided Recursive Intelligence: The Strange Metamorphosis Loop},
  author={Judan, Michael},
  journal={Submitted to NeurIPS},
  year={2025},
  note={Available at: github.com/kaizencycle/Mobius-Substrate}
}

@article{mobius2025negentropic,
  title={Negentropic Economics: Unifying Thermodynamics and Economic Theory},
  author={Judan, Michael},
  journal={Submitted to Nature Physics},
  year={2025}
}

@article{mobius2025mcp,
  title={Mobius Cycle Protocol: Operationally-Enforced Recursive Intelligence},
  author={Judan, Michael},
  journal={Submitted to IEEE TSE},
  year={2025}
}
```

---

## Research Support

### Data Access

PhD candidates may request:
- Production data from cycles C-103 to C-148
- Historical economic validation data
- MCP attestation records

Contact: academics@mobius.systems

### Collaboration

Mobius Systems welcomes:
- Co-authorship opportunities
- Dataset contributions
- Replication studies
- Advisory relationships

### Funding

Potential funding sources:
- NSF AI Safety grants
- NIH computational social science
- DOE complex systems research
- Private foundations (Open Philanthropy, etc.)

---

## Timeline Guidance

### Year 1: Foundation
- Literature review
- Methodology development
- Initial experiments
- Conference paper

### Year 2: Core Research
- Main experiments
- Data collection
- Analysis
- Journal paper(s)

### Year 3: Completion
- Remaining experiments
- Thesis writing
- Defense preparation
- Revisions

---

## Committee Suggestions

### For SML Dissertations

**Chair Specializations:**
- Machine learning
- Human-computer interaction
- AI safety

**Committee Members:**
- Cognitive science
- Ethics/philosophy
- Statistics

### For Negentropic Economics

**Chair Specializations:**
- Macroeconomics
- Economic theory
- Econophysics

**Committee Members:**
- Statistical physics
- Public policy
- Econometrics

### For MCP Dissertations

**Chair Specializations:**
- Software engineering
- Distributed systems
- AI/ML

**Committee Members:**
- Cryptography
- Formal methods
- AI governance

---

## Quality Checklist

Before submission, verify:

- [ ] All theorems have complete proofs
- [ ] All claims are supported by evidence
- [ ] Methodology is reproducible
- [ ] Data is properly cited
- [ ] Code is available
- [ ] Bibliography is complete
- [ ] Formatting follows guidelines
- [ ] Acknowledgments included

---

## Contact

**Academic inquiries:** academics@mobius.systems  
**Data requests:** datasets@mobius.systems  
**Collaboration:** founder@mobius.systems

---

## License

All templates released under **CC0 1.0 Universal (Public Domain)**.

Adapt freely for your institution's requirements.

---

*"The goal of a PhD is not to prove you know everything, but to demonstrate you can make original contributions to human knowledge."*
