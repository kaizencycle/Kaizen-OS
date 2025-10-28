"""
Lab2: Deliberation Orchestrator + Consensus Engine
Multi-LLM deliberation with bounded loops and consensus calculation
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
import time


@dataclass
class Round:
    """Single deliberation round"""
    round_number: int
    responses: List[Dict]
    agreement_score: float
    timestamp: datetime


@dataclass
class Consensus:
    """Consensus result"""
    reached: bool
    level: str  # strong, moderate, weak, no_consensus
    agreement_score: float
    decision: str
    summary: str
    voting: Dict[str, List[str]]
    dissent: Optional[str]
    confidence: float

    def to_dict(self) -> Dict:
        return {
            "reached": self.reached,
            "level": self.level,
            "agreement_score": self.agreement_score,
            "decision": self.decision,
            "summary": self.summary,
            "voting": self.voting,
            "dissent": self.dissent,
            "confidence": self.confidence
        }


class DeliberationOrchestrator:
    """
    Orchestrates multi-model deliberation with bounded iteration

    Features:
    - Bounded deliberation loops (max 5 rounds)
    - Timeout protection (5 minutes max)
    - Round-robin coordination
    - Convergence detection
    - Real-time updates via callbacks
    """

    MAX_ROUNDS = 5
    TIMEOUT_SECONDS = 300  # 5 minutes
    CONVERGENCE_THRESHOLD = 0.85

    def __init__(self, model_router, gi_engine=None):
        """
        Initialize deliberation orchestrator

        Args:
            model_router: ModelRouter instance for querying LLMs
            gi_engine: GI scoring engine for constitutional validation
        """
        self.model_router = model_router
        self.gi_engine = gi_engine
        self.active_sessions: Dict[str, 'DeliberationSession'] = {}

    async def create_session(
        self,
        question: str,
        models: List[str],
        context: Optional[Dict] = None
    ) -> str:
        """
        Create a new deliberation session

        Args:
            question: Question to deliberate
            models: List of model IDs to include
            context: Optional context

        Returns:
            Session ID
        """
        session_id = f"delib_{int(time.time() * 1000)}"

        session = DeliberationSession(
            session_id=session_id,
            question=question,
            models=models,
            context=context or {},
            max_rounds=self.MAX_ROUNDS,
            timeout=self.TIMEOUT_SECONDS
        )

        self.active_sessions[session_id] = session

        print(f"📋 Deliberation session created: {session_id}")
        print(f"   Question: {question}")
        print(f"   Models: {', '.join(models)}")

        return session_id

    async def run_session(self, session_id: str, callback=None) -> Consensus:
        """
        Run deliberation session to completion

        Args:
            session_id: Session ID
            callback: Optional callback for real-time updates

        Returns:
            Consensus result
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session not found: {session_id}")

        session = self.active_sessions[session_id]
        start_time = time.time()

        # Run deliberation rounds
        while session.current_round < session.max_rounds:
            # Check timeout
            if time.time() - start_time > session.timeout:
                return self._timeout_result(session)

            # Run round
            round_result = await self._run_round(session)

            # Callback for real-time updates
            if callback:
                await callback({
                    "type": "round_complete",
                    "round": session.current_round,
                    "agreement": round_result.agreement_score
                })

            # Check for convergence
            if round_result.agreement_score >= self.CONVERGENCE_THRESHOLD:
                consensus = await self._calculate_consensus(session)

                if callback:
                    await callback({
                        "type": "deliberation_complete",
                        "consensus": consensus.to_dict()
                    })

                return consensus

            session.current_round += 1

        # Max rounds reached
        return await self._calculate_consensus(session)

    async def _run_round(self, session: 'DeliberationSession') -> Round:
        """Run a single deliberation round"""
        print(f"\n🔄 Round {session.current_round + 1}/{session.max_rounds}")

        # Prepare prompt for this round
        prompt = self._prepare_prompt(session)

        # Query all models in parallel
        responses = await self.model_router.query_all(
            prompt=prompt,
            model_ids=session.models,
            context=session.context
        )

        # Calculate agreement for this round
        agreement = self._calculate_agreement(responses)

        # Create round result
        round_result = Round(
            round_number=session.current_round,
            responses=[
                {
                    "model": r.model_id,
                    "response": r.response,
                    "tokens": r.tokens
                }
                for r in responses
            ],
            agreement_score=agreement,
            timestamp=datetime.utcnow()
        )

        session.rounds.append(round_result)

        print(f"   Agreement score: {agreement:.2f}")

        return round_result

    def _prepare_prompt(self, session: 'DeliberationSession') -> str:
        """Prepare prompt for current round"""
        if session.current_round == 0:
            # Initial round - just the question
            return session.question

        # Subsequent rounds - include previous responses
        previous_round = session.rounds[-1]
        prev_responses = "\n\n".join([
            f"**{r['model']}:** {r['response'][:200]}..."
            for r in previous_round.responses
        ])

        return f"""
{session.question}

PREVIOUS RESPONSES FROM OTHER MODELS:
{prev_responses}

Given the above responses, provide your refined answer. Focus on:
- Points of agreement
- Key disagreements
- Your final recommendation
"""

    def _calculate_agreement(self, responses: List) -> float:
        """
        Calculate agreement score between responses

        Uses simplified semantic similarity - in production would use
        embeddings and cosine similarity
        """
        if len(responses) < 2:
            return 1.0

        # Simple keyword-based agreement (production would use embeddings)
        all_text = " ".join([r.response.lower() for r in responses])

        # Check for agreement keywords
        agreement_keywords = [
            "agree", "yes", "approved", "recommend", "should", "implement"
        ]
        disagreement_keywords = [
            "disagree", "no", "rejected", "not recommend", "should not"
        ]

        agreement_count = sum(1 for kw in agreement_keywords if kw in all_text)
        disagreement_count = sum(1 for kw in disagreement_keywords if kw in all_text)

        total = agreement_count + disagreement_count
        if total == 0:
            return 0.5  # Neutral

        # Calculate score
        score = agreement_count / total

        return score

    async def _calculate_consensus(self, session: 'DeliberationSession') -> Consensus:
        """Calculate final consensus from all rounds"""
        if not session.rounds:
            return Consensus(
                reached=False,
                level="no_consensus",
                agreement_score=0.0,
                decision="UNDECIDED",
                summary="No deliberation rounds completed",
                voting={"approve": [], "reject": [], "abstain": []},
                dissent=None,
                confidence=0.0
            )

        # Get final round
        final_round = session.rounds[-1]
        agreement = final_round.agreement_score

        # Determine consensus level
        if agreement >= 0.90:
            level = "strong"
        elif agreement >= 0.75:
            level = "moderate"
        elif agreement >= 0.60:
            level = "weak"
        else:
            level = "no_consensus"

        # Analyze voting
        voting = self._analyze_voting(final_round.responses)

        # Determine decision
        if len(voting["approve"]) > len(voting["reject"]):
            decision = "APPROVED"
        elif len(voting["reject"]) > len(voting["approve"]):
            decision = "REJECTED"
        else:
            decision = "UNDECIDED"

        # Create summary
        summary = self._create_summary(final_round.responses, decision)

        # Check for dissent
        dissent = None
        if agreement < 0.85:
            dissent = "Some models expressed reservations or disagreement"

        # Validate with GI scoring if available
        confidence = agreement
        if self.gi_engine:
            # Would calculate GI score for the consensus
            # For now, use agreement as confidence
            pass

        consensus = Consensus(
            reached=agreement >= 0.75,
            level=level,
            agreement_score=agreement,
            decision=decision,
            summary=summary,
            voting=voting,
            dissent=dissent,
            confidence=confidence
        )

        print(f"\n✅ Consensus reached: {decision}")
        print(f"   Level: {level}")
        print(f"   Agreement: {agreement:.2f}")
        print(f"   Confidence: {confidence:.2f}")

        return consensus

    def _analyze_voting(self, responses: List[Dict]) -> Dict[str, List[str]]:
        """Analyze model votes from responses"""
        voting = {
            "approve": [],
            "reject": [],
            "abstain": []
        }

        for response in responses:
            text = response["response"].lower()
            model = response["model"]

            if any(word in text for word in ["approve", "yes", "should implement"]):
                voting["approve"].append(model)
            elif any(word in text for word in ["reject", "no", "should not"]):
                voting["reject"].append(model)
            else:
                voting["abstain"].append(model)

        return voting

    def _create_summary(self, responses: List[Dict], decision: str) -> str:
        """Create consensus summary from responses"""
        model_names = [r["model"] for r in responses]

        if decision == "APPROVED":
            return f"All models ({', '.join(model_names)}) agree that the proposal should be approved."
        elif decision == "REJECTED":
            return f"Majority of models ({', '.join(model_names)}) recommend rejecting the proposal."
        else:
            return f"Models ({', '.join(model_names)}) could not reach clear consensus."

    def _timeout_result(self, session: 'DeliberationSession') -> Consensus:
        """Generate result for timeout"""
        return Consensus(
            reached=False,
            level="timeout",
            agreement_score=0.0,
            decision="TIMEOUT",
            summary=f"Deliberation timeout after {session.timeout}s",
            voting={"approve": [], "reject": [], "abstain": []},
            dissent="Timeout occurred before consensus",
            confidence=0.0
        )


@dataclass
class DeliberationSession:
    """Deliberation session state"""
    session_id: str
    question: str
    models: List[str]
    context: Dict
    max_rounds: int
    timeout: int
    current_round: int = 0
    rounds: List[Round] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.utcnow)


# Example usage
if __name__ == "__main__":
    from model_router import ModelRouter, ModelConfig
    import os

    async def demo():
        print("🤝 Deliberation Orchestrator Demo\n")

        # Set up model router
        models = {
            "claude": ModelConfig(
                provider="anthropic",
                model="claude-sonnet-4-5-20250929",
                api_key=os.getenv("ANTHROPIC_API_KEY", "test_key"),
                max_tokens=1000,
                temperature=0.7,
                expertise=["ethics"],
                weight=1.2
            )
        }

        router = ModelRouter(models)
        orchestrator = DeliberationOrchestrator(router)

        # Create deliberation session
        session_id = await orchestrator.create_session(
            question="Should we implement multi-factor authentication for all users?",
            models=["claude"]
        )

        # Run session
        print("\n🔄 Running deliberation...\n")
        consensus = await orchestrator.run_session(session_id)

        print("\n📊 Final Consensus:")
        print(f"   Decision: {consensus.decision}")
        print(f"   Level: {consensus.level}")
        print(f"   Agreement: {consensus.agreement_score:.2f}")
        print(f"   Summary: {consensus.summary}")

        await router.close()

    # Run demo
    asyncio.run(demo())
