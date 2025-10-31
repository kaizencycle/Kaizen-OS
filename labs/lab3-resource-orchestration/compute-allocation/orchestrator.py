#!/usr/bin/env python3
"""
Lab 3 - Module 1: Compute Allocation Orchestrator
Routes AI queries to optimal providers based on cost, latency, quality, and citizen quotas
Backend for Lab 2 (Thought Broker)
"""

import time
import logging
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum

logging.basicConfig(level=logging.INFO)
LOG = logging.getLogger("compute_orchestrator")

class Priority(str, Enum):
    URGENT = "urgent"       # <1s latency required (emergency)
    HIGH = "high"           # <2s latency (real-time conversation)
    STANDARD = "standard"   # <5s latency (normal queries)
    BATCH = "batch"         # <30s latency (analysis, research)
    BACKGROUND = "background"  # No time limit (training, indexing)

@dataclass
class Provider:
    """AI compute provider configuration"""
    name: str
    cost_per_1k_tokens: float    # USD/GIC cost
    avg_latency_ms: int          # Average response time
    quality_score: float         # 0.0-1.0 output quality
    max_context_tokens: int
    supports_streaming: bool
    reliability: float           # 0.0-1.0 uptime
    endpoint: str

@dataclass
class ComputeAllocation:
    """Result of compute allocation decision"""
    provider: str
    estimated_cost: float
    estimated_latency_ms: int
    quota_remaining: float
    fallback_provider: Optional[str]
    reason: str

class ComputeOrchestrator:
    """
    Allocates AI compute resources across providers
    Optimizes for: cost, latency, quality, quota, reliability
    """

    def __init__(self):
        # Provider registry (can be loaded from config/DB)
        self.providers = {
            "anthropic_claude": Provider(
                name="anthropic_claude",
                cost_per_1k_tokens=0.015,
                avg_latency_ms=600,
                quality_score=0.97,
                max_context_tokens=200000,
                supports_streaming=True,
                reliability=0.99,
                endpoint="https://api.anthropic.com/v1"
            ),
            "openai_gpt4": Provider(
                name="openai_gpt4",
                cost_per_1k_tokens=0.01,
                avg_latency_ms=500,
                quality_score=0.95,
                max_context_tokens=128000,
                supports_streaming=True,
                reliability=0.98,
                endpoint="https://api.openai.com/v1"
            ),
            "google_gemini": Provider(
                name="google_gemini",
                cost_per_1k_tokens=0.008,
                avg_latency_ms=700,
                quality_score=0.93,
                max_context_tokens=2000000,
                supports_streaming=True,
                reliability=0.97,
                endpoint="https://generativelanguage.googleapis.com/v1"
            ),
            "deepseek": Provider(
                name="deepseek",
                cost_per_1k_tokens=0.002,
                avg_latency_ms=1000,
                quality_score=0.88,
                max_context_tokens=64000,
                supports_streaming=True,
                reliability=0.95,
                endpoint="https://api.deepseek.com/v1"
            ),
            "local_llama": Provider(
                name="local_llama",
                cost_per_1k_tokens=0.0001,  # Just electricity cost
                avg_latency_ms=2000,
                quality_score=0.75,
                max_context_tokens=8000,
                supports_streaming=True,
                reliability=0.99,  # Local = high reliability
                endpoint="http://localhost:11434/v1"
            )
        }

        # Citizen quotas (in GIC per month)
        self.monthly_quotas = {}  # citizen_did -> quota_remaining
        self.default_quota = 100.0  # 100 GIC/month for standard citizens

        # Provider health tracking
        self.provider_health = {p: 1.0 for p in self.providers}

        # Cost tracking
        self.total_cost_this_month = 0.0
        self.queries_this_month = 0

    def allocate(
        self,
        citizen_did: str,
        query_tokens: int,
        priority: Priority = Priority.STANDARD,
        min_quality: float = 0.80,
        max_cost_gic: Optional[float] = None,
        preferred_provider: Optional[str] = None
    ) -> ComputeAllocation:
        """
        Allocate compute for a query

        Args:
            citizen_did: Citizen's DID
            query_tokens: Estimated token count
            priority: Query priority level
            min_quality: Minimum acceptable quality score
            max_cost_gic: Maximum cost citizen willing to pay
            preferred_provider: Optional provider preference

        Returns:
            ComputeAllocation decision
        """

        # Check quota
        quota_remaining = self._check_quota(citizen_did)

        # If quota exhausted, force local model
        if quota_remaining <= 0:
            return self._allocate_local_fallback(query_tokens, quota_remaining)

        # Filter providers by constraints
        candidates = self._filter_providers(
            query_tokens=query_tokens,
            priority=priority,
            min_quality=min_quality,
            max_cost_gic=max_cost_gic or quota_remaining
        )

        if not candidates:
            return self._allocate_local_fallback(query_tokens, quota_remaining)

        # Prefer user's choice if available
        if preferred_provider and preferred_provider in candidates:
            provider = self.providers[preferred_provider]
            return self._create_allocation(provider, query_tokens, quota_remaining)

        # Score candidates
        best_provider = self._score_and_select(candidates, priority, query_tokens)

        return self._create_allocation(
            self.providers[best_provider],
            query_tokens,
            quota_remaining
        )

    def _check_quota(self, citizen_did: str) -> float:
        """Check citizen's remaining quota"""
        if citizen_did not in self.monthly_quotas:
            self.monthly_quotas[citizen_did] = self.default_quota
        return self.monthly_quotas[citizen_did]

    def _deduct_quota(self, citizen_did: str, cost: float):
        """Deduct cost from citizen's quota"""
        if citizen_did in self.monthly_quotas:
            self.monthly_quotas[citizen_did] -= cost

    def _filter_providers(
        self,
        query_tokens: int,
        priority: Priority,
        min_quality: float,
        max_cost_gic: float
    ) -> List[str]:
        """Filter providers that meet requirements"""
        candidates = []

        for name, provider in self.providers.items():
            # Check quality
            if provider.quality_score < min_quality:
                continue

            # Check context window
            if query_tokens > provider.max_context_tokens:
                continue

            # Check cost
            estimated_cost = (query_tokens / 1000) * provider.cost_per_1k_tokens
            if estimated_cost > max_cost_gic:
                continue

            # Check latency for priority
            if priority == Priority.URGENT and provider.avg_latency_ms > 1000:
                continue
            if priority == Priority.HIGH and provider.avg_latency_ms > 2000:
                continue

            # Check health
            if self.provider_health.get(name, 0) < 0.5:
                continue

            candidates.append(name)

        return candidates

    def _score_and_select(
        self,
        candidates: List[str],
        priority: Priority,
        query_tokens: int
    ) -> str:
        """
        Score providers and select best
        Scoring considers: cost, latency, quality, reliability
        """
        scores = {}

        for name in candidates:
            provider = self.providers[name]

            # Normalize metrics (0-1 scale, higher is better)
            cost_score = 1.0 - min(provider.cost_per_1k_tokens / 0.02, 1.0)
            latency_score = 1.0 - min(provider.avg_latency_ms / 3000, 1.0)
            quality_score = provider.quality_score
            reliability_score = provider.reliability
            health_score = self.provider_health.get(name, 1.0)

            # Weight based on priority
            if priority in [Priority.URGENT, Priority.HIGH]:
                # Latency is king
                weights = {"cost": 0.1, "latency": 0.5, "quality": 0.2, "reliability": 0.2}
            elif priority == Priority.BATCH:
                # Cost is king
                weights = {"cost": 0.6, "latency": 0.05, "quality": 0.25, "reliability": 0.1}
            else:  # STANDARD, BACKGROUND
                # Balanced
                weights = {"cost": 0.3, "latency": 0.2, "quality": 0.3, "reliability": 0.2}

            # Composite score
            score = (
                cost_score * weights["cost"] +
                latency_score * weights["latency"] +
                quality_score * weights["quality"] +
                reliability_score * weights["reliability"]
            ) * health_score

            scores[name] = score

        # Return highest score
        return max(scores, key=scores.get)

    def _create_allocation(
        self,
        provider: Provider,
        query_tokens: int,
        quota_remaining: float
    ) -> ComputeAllocation:
        """Create allocation result"""
        estimated_cost = (query_tokens / 1000) * provider.cost_per_1k_tokens

        return ComputeAllocation(
            provider=provider.name,
            estimated_cost=estimated_cost,
            estimated_latency_ms=provider.avg_latency_ms,
            quota_remaining=quota_remaining - estimated_cost,
            fallback_provider="local_llama",
            reason=f"Optimal for cost={estimated_cost:.4f}, latency={provider.avg_latency_ms}ms"
        )

    def _allocate_local_fallback(
        self,
        query_tokens: int,
        quota_remaining: float
    ) -> ComputeAllocation:
        """Fallback to local model when quota exhausted or no providers available"""
        provider = self.providers["local_llama"]
        estimated_cost = (query_tokens / 1000) * provider.cost_per_1k_tokens

        return ComputeAllocation(
            provider="local_llama",
            estimated_cost=estimated_cost,
            estimated_latency_ms=provider.avg_latency_ms,
            quota_remaining=quota_remaining,
            fallback_provider=None,
            reason="Quota exhausted or no suitable providers - using local model"
        )

    def report_usage(
        self,
        citizen_did: str,
        provider: str,
        actual_cost: float,
        success: bool
    ):
        """Report actual usage after query completes"""
        if success:
            self._deduct_quota(citizen_did, actual_cost)
            self.total_cost_this_month += actual_cost
            self.queries_this_month += 1
        else:
            # Penalize provider health on failure
            if provider in self.provider_health:
                self.provider_health[provider] *= 0.95

        LOG.info(
            "Query complete: citizen=%s provider=%s cost=%.4f success=%s",
            citizen_did[:12], provider, actual_cost, success
        )

    def get_stats(self) -> Dict[str, Any]:
        """Get orchestrator statistics"""
        return {
            "total_cost_this_month": round(self.total_cost_this_month, 4),
            "queries_this_month": self.queries_this_month,
            "avg_cost_per_query": round(
                self.total_cost_this_month / max(self.queries_this_month, 1), 4
            ),
            "provider_health": {k: round(v, 3) for k, v in self.provider_health.items()},
            "active_citizens": len(self.monthly_quotas)
        }

# Singleton instance
ORCHESTRATOR = ComputeOrchestrator()
