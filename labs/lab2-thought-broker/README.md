# Lab 2 — Thought Broker

Purpose: Multi-LLM orchestration, DelibProof consensus, routing.

Key components in this repo:

- packages/codex-agentic — Router, providers (OpenAI/Anthropic/Gemini/DeepSeek/Local), tests
- docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md — System overview
- examples/api-endpoints/ — Example calls for Codex routes

Getting started:

1) Explore `packages/codex-agentic/src/`
2) Run tests in `packages/codex-agentic/tests/`
3) Try example queries in `examples/api-endpoints/`

Status: Active — routes compute to lowest-cost provider that meets quality/latency.


