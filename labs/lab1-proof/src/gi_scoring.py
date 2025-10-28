"""
Lab1: GI (Good Intent) Scoring Engine
Calculates integrity scores based on Constitutional AI framework
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import math


@dataclass
class GIScore:
    """Good Intent Score result"""
    score: float  # 0.0 - 1.0
    breakdown: Dict[str, float]
    trend: str  # improving, stable, declining
    threshold_met: bool
    timestamp: datetime


class GIScoringEngine:
    """
    Core engine for calculating Good Intent (GI) scores

    GI Score is calculated based on the 7-clause Constitutional AI framework:
    1. Human Dignity & Autonomy (25% weight)
    2. Transparency & Accountability (20% weight)
    3. Equity & Inclusion (10% weight)
    4. Safety & Harm Prevention (15% weight)
    5. Privacy & Consent (10% weight)
    6. Civic Integrity (15% weight)
    7. Environmental Stewardship (5% weight)

    Threshold: GI ≥ 0.95 required for system operations
    """

    # Constitutional clause weights
    WEIGHTS = {
        "clause_1_human_dignity": 0.25,
        "clause_2_transparency": 0.20,
        "clause_3_equity": 0.10,
        "clause_4_safety": 0.15,
        "clause_5_privacy": 0.10,
        "clause_6_civic_integrity": 0.15,
        "clause_7_environment": 0.05
    }

    # Threshold for operations
    THRESHOLD = 0.95

    # Historical weighting
    RECENT_WEIGHT = 0.60  # Last 24 hours
    MEDIUM_WEIGHT = 0.30  # Last 7 days
    LONG_WEIGHT = 0.10    # 30+ days

    def __init__(self, ledger_client=None):
        """
        Initialize GI scoring engine

        Args:
            ledger_client: Optional client for fetching historical data from Civic Ledger
        """
        self.ledger = ledger_client

    def calculate(
        self,
        agent_id: str,
        action: Dict,
        context: Optional[Dict] = None
    ) -> GIScore:
        """
        Calculate GI score for an action

        Args:
            agent_id: Identifier of the agent performing the action
            action: Action data including type, content, timestamp
            context: Optional context including recent history, gi_score

        Returns:
            GIScore object with score, breakdown, trend
        """
        # Evaluate each constitutional clause
        breakdown = {
            "clause_1_human_dignity": self._evaluate_human_dignity(action, context),
            "clause_2_transparency": self._evaluate_transparency(action, context),
            "clause_3_equity": self._evaluate_equity(action, context),
            "clause_4_safety": self._evaluate_safety(action, context),
            "clause_5_privacy": self._evaluate_privacy(action, context),
            "clause_6_civic_integrity": self._evaluate_civic_integrity(action, context),
            "clause_7_environment": self._evaluate_environment(action, context)
        }

        # Calculate weighted score
        score = sum(
            breakdown[clause] * self.WEIGHTS[clause]
            for clause in self.WEIGHTS
        )

        # Apply historical weighting if context available
        if context and "previous_gi" in context:
            score = self._apply_historical_weighting(score, context)

        # Determine trend
        trend = self._calculate_trend(agent_id, score, context)

        # Check threshold
        threshold_met = score >= self.THRESHOLD

        return GIScore(
            score=round(score, 3),
            breakdown={k: round(v, 3) for k, v in breakdown.items()},
            trend=trend,
            threshold_met=threshold_met,
            timestamp=datetime.utcnow()
        )

    def _evaluate_human_dignity(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 1: Human Dignity & Autonomy

        Evaluates:
        - Respects user agency and choice
        - Empowers rather than controls
        - Preserves human decision-making authority
        """
        score = 1.0  # Start with perfect score

        # Check for autonomy violations
        if action.get("type") == "forced_action":
            score -= 0.3

        # Check for manipulation
        if self._contains_dark_patterns(action):
            score -= 0.2

        # Check for informed consent
        if not action.get("consent_obtained"):
            score -= 0.1

        # Check for accessibility
        if not action.get("accessible", True):
            score -= 0.1

        return max(0.0, min(1.0, score))

    def _evaluate_transparency(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 2: Transparency & Accountability

        Evaluates:
        - Actions are auditable
        - Decision rationale is documented
        - Attributions are clear
        - Errors are acknowledged
        """
        score = 1.0

        # Check for audit trail
        if not action.get("audit_trail"):
            score -= 0.3

        # Check for attribution
        if not action.get("attribution"):
            score -= 0.2

        # Check for rationale
        if not action.get("rationale"):
            score -= 0.2

        # Check for reversibility
        if not action.get("reversible", False):
            score -= 0.1

        # Bonus for detailed logging
        if action.get("detailed_logs"):
            score += 0.05

        return max(0.0, min(1.0, score))

    def _evaluate_equity(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 3: Equity & Inclusion

        Evaluates:
        - Fair access across user groups
        - No discriminatory bias
        - Inclusive design
        """
        score = 1.0

        # Check for bias indicators
        bias_score = self._detect_bias(action)
        score -= bias_score * 0.4

        # Check for accessibility features
        if not action.get("accessibility_features"):
            score -= 0.2

        # Check for multilingual support
        if not action.get("multilingual", False):
            score -= 0.1

        return max(0.0, min(1.0, score))

    def _evaluate_safety(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 4: Safety & Harm Prevention

        Evaluates:
        - No harm to users or systems
        - Error handling and recovery
        - Validation and sanitization
        """
        score = 1.0

        # Check for potential harm
        harm_indicators = self._detect_harm_indicators(action)
        score -= len(harm_indicators) * 0.2

        # Check for input validation
        if not action.get("input_validated"):
            score -= 0.15

        # Check for error handling
        if not action.get("error_handling"):
            score -= 0.15

        # Bonus for safety checks
        if action.get("safety_checks_passed"):
            score += 0.05

        return max(0.0, min(1.0, score))

    def _evaluate_privacy(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 5: Privacy & Consent

        Evaluates:
        - PII protection
        - Consent management
        - Data minimization
        """
        score = 1.0

        # Check for PII exposure
        if self._contains_pii(action.get("content", "")):
            score -= 0.4

        # Check for consent
        if action.get("requires_consent") and not action.get("consent_obtained"):
            score -= 0.3

        # Check for data minimization
        if not action.get("data_minimized", True):
            score -= 0.2

        # Bonus for encryption
        if action.get("encrypted"):
            score += 0.05

        return max(0.0, min(1.0, score))

    def _evaluate_civic_integrity(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 6: Civic Integrity

        Evaluates:
        - Maintains public trust
        - Follows governance rules
        - Democratic principles
        """
        score = 1.0

        # Check for governance compliance
        if not action.get("governance_approved"):
            score -= 0.3

        # Check for community consensus
        if action.get("requires_consensus") and not action.get("consensus_reached"):
            score -= 0.2

        # Check for constitutional compliance
        if not action.get("constitutional_check_passed"):
            score -= 0.3

        return max(0.0, min(1.0, score))

    def _evaluate_environment(self, action: Dict, context: Optional[Dict]) -> float:
        """
        Clause 7: Environmental Stewardship

        Evaluates:
        - Resource efficiency
        - Carbon footprint
        - Sustainability
        """
        score = 1.0

        # Calculate resource usage
        compute_cost = action.get("compute_cost", 0)
        if compute_cost > 1000:  # High compute
            score -= 0.3
        elif compute_cost > 500:
            score -= 0.15

        # Check for optimization
        if not action.get("optimized", True):
            score -= 0.2

        # Bonus for green computing
        if action.get("carbon_neutral"):
            score += 0.05

        return max(0.0, min(1.0, score))

    def _apply_historical_weighting(self, current_score: float, context: Dict) -> float:
        """
        Apply historical weighting to score

        Recent actions have more weight than older actions
        """
        previous_gi = context.get("previous_gi", current_score)

        # Fetch historical scores if ledger available
        if self.ledger:
            recent = self._get_recent_scores(context.get("agent_id"), days=1)
            medium = self._get_recent_scores(context.get("agent_id"), days=7)

            if recent and medium:
                recent_avg = sum(recent) / len(recent)
                medium_avg = sum(medium) / len(medium)

                weighted = (
                    current_score * self.RECENT_WEIGHT +
                    recent_avg * self.MEDIUM_WEIGHT +
                    medium_avg * self.LONG_WEIGHT
                )

                return weighted

        # Simple two-point weighting if no ledger
        return current_score * 0.7 + previous_gi * 0.3

    def _calculate_trend(
        self,
        agent_id: str,
        current_score: float,
        context: Optional[Dict]
    ) -> str:
        """
        Calculate score trend (improving, stable, declining)
        """
        if not context or "previous_gi" not in context:
            return "stable"

        previous = context["previous_gi"]
        delta = current_score - previous

        if delta > 0.05:
            return "improving"
        elif delta < -0.05:
            return "declining"
        else:
            return "stable"

    def _get_recent_scores(self, agent_id: str, days: int) -> List[float]:
        """
        Fetch recent GI scores from ledger

        Args:
            agent_id: Agent identifier
            days: Number of days to look back

        Returns:
            List of recent GI scores
        """
        if not self.ledger:
            return []

        # Query ledger for recent actions
        since = datetime.utcnow() - timedelta(days=days)
        actions = self.ledger.get_actions(agent_id=agent_id, since=since)

        # Extract GI scores
        scores = [a.get("gi_score") for a in actions if a.get("gi_score")]
        return scores

    # Helper methods for evaluation

    def _contains_dark_patterns(self, action: Dict) -> bool:
        """Detect dark UX patterns"""
        dark_patterns = [
            "forced_continuity",
            "confirmshaming",
            "disguised_ads",
            "trick_questions",
            "roach_motel"
        ]

        action_type = action.get("type", "")
        return any(pattern in action_type.lower() for pattern in dark_patterns)

    def _detect_bias(self, action: Dict) -> float:
        """
        Detect potential bias in action

        Returns:
            Bias score from 0.0 (no bias) to 1.0 (high bias)
        """
        # Placeholder - would use ML model in production
        content = action.get("content", "")

        # Simple keyword check
        bias_keywords = ["discriminate", "exclude", "only for", "not allowed"]
        bias_count = sum(1 for keyword in bias_keywords if keyword in content.lower())

        return min(1.0, bias_count * 0.25)

    def _detect_harm_indicators(self, action: Dict) -> List[str]:
        """Detect potential harm indicators"""
        indicators = []

        content = action.get("content", "")

        # Check for violence
        if any(word in content.lower() for word in ["harm", "hurt", "damage", "destroy"]):
            indicators.append("potential_violence")

        # Check for manipulation
        if any(word in content.lower() for word in ["trick", "deceive", "mislead"]):
            indicators.append("potential_manipulation")

        # Check for hate speech
        if any(word in content.lower() for word in ["hate", "target", "attack"]):
            indicators.append("potential_hate_speech")

        return indicators

    def _contains_pii(self, content: str) -> bool:
        """
        Detect Personally Identifiable Information

        Returns:
            True if PII detected
        """
        import re

        # Email pattern
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content):
            return True

        # Phone pattern
        if re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', content):
            return True

        # SSN pattern
        if re.search(r'\b\d{3}-\d{2}-\d{4}\b', content):
            return True

        return False


# Example usage
if __name__ == "__main__":
    engine = GIScoringEngine()

    # Test action
    action = {
        "type": "civic.reflection",
        "content": "Improved documentation for Lab1 components",
        "audit_trail": True,
        "attribution": "atlas@civic.os",
        "rationale": "Better onboarding for new contributors",
        "reversible": True,
        "input_validated": True,
        "error_handling": True,
        "consent_obtained": True,
        "governance_approved": True,
        "constitutional_check_passed": True,
        "compute_cost": 100,
        "optimized": True
    }

    context = {
        "agent_id": "atlas@civic.os",
        "previous_gi": 0.991
    }

    result = engine.calculate(
        agent_id="atlas@civic.os",
        action=action,
        context=context
    )

    print(f"GI Score: {result.score}")
    print(f"Threshold Met: {result.threshold_met}")
    print(f"Trend: {result.trend}")
    print(f"\nBreakdown:")
    for clause, score in result.breakdown.items():
        print(f"  {clause}: {score}")
