# Lab 2 — Thought Broker

Purpose: Multi-LLM orchestration, DelibProof consensus, routing.

Where to look in this repo:
- packages/codex-agentic — Router, providers (OpenAI/Anthropic/Gemini/DeepSeek/Local), tests
- examples/api-endpoints — Example calls for Codex routes
- apps/api-gateway — Thin gateway proxying Codex routes
- packages/civic-sdk — Hub client and routing helpers

Getting started:
1) Explore `packages/codex-agentic/src/`
2) Run tests in `packages/codex-agentic/tests/`
3) Try example queries in `examples/api-endpoints/`

Status: Active — routes compute to lowest-cost provider that meets quality/latency.


