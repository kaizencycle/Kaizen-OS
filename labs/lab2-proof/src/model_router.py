"""
Lab2: Model Router - Multi-LLM Orchestration
Routes requests to different LLM providers (Claude, GPT, Gemini, DeepSeek)
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio
import httpx


@dataclass
class ModelConfig:
    """Configuration for an LLM model"""
    provider: str  # anthropic, openai, google, deepseek
    model: str
    api_key: str
    max_tokens: int
    temperature: float
    expertise: List[str]
    weight: float


@dataclass
class ModelResponse:
    """Response from an LLM model"""
    model_id: str
    response: str
    timestamp: datetime
    tokens: int
    latency_ms: float


class ModelRouter:
    """
    Routes deliberation requests to appropriate LLM providers

    Supports:
    - Claude (Anthropic)
    - GPT-4 (OpenAI)
    - Gemini (Google)
    - DeepSeek
    - Custom models via API
    """

    # Constitutional AI system prompt
    CONSTITUTIONAL_PROMPT = """
You are operating within Kaizen-OS, a Constitutional AI system.

CONSTITUTION (7 Clauses):
1. Human Dignity & Autonomy - Respect user agency
2. Transparency & Accountability - Be auditable
3. Equity & Inclusion - Serve all fairly
4. Safety & Harm Prevention - Do no harm
5. Privacy & Consent - Protect data
6. Civic Integrity - Maintain public trust
7. Environmental Stewardship - Minimize waste

You must maintain GI (Good Intent) score ≥ 0.95 at all times.
"""

    def __init__(self, models: Dict[str, ModelConfig]):
        """
        Initialize model router

        Args:
            models: Dictionary mapping model_id to ModelConfig
        """
        self.models = models
        self.clients = {}

        # Initialize HTTP clients for each provider
        for model_id, config in models.items():
            self.clients[model_id] = httpx.AsyncClient(
                timeout=60.0,
                headers=self._get_headers(config)
            )

    async def query(
        self,
        model_id: str,
        prompt: str,
        context: Optional[Dict] = None
    ) -> ModelResponse:
        """
        Send prompt to specific model

        Args:
            model_id: Model identifier (e.g., "claude", "gpt4")
            prompt: User prompt
            context: Optional context including previous responses

        Returns:
            ModelResponse with response text and metadata
        """
        if model_id not in self.models:
            raise ValueError(f"Unknown model: {model_id}")

        config = self.models[model_id]

        # Wrap prompt with constitutional context
        full_prompt = self._wrap_with_constitution(prompt, context)

        # Query model with retry logic
        start_time = datetime.utcnow()
        response = await self._query_with_retry(
            model_id=model_id,
            prompt=full_prompt,
            config=config,
            max_retries=3
        )
        end_time = datetime.utcnow()

        latency_ms = (end_time - start_time).total_seconds() * 1000

        return ModelResponse(
            model_id=model_id,
            response=response["text"],
            timestamp=end_time,
            tokens=response["tokens"],
            latency_ms=latency_ms
        )

    async def query_all(
        self,
        prompt: str,
        model_ids: List[str],
        context: Optional[Dict] = None
    ) -> List[ModelResponse]:
        """
        Query multiple models in parallel

        Args:
            prompt: User prompt
            model_ids: List of model identifiers to query
            context: Optional context

        Returns:
            List of ModelResponse objects
        """
        tasks = [
            self.query(model_id, prompt, context)
            for model_id in model_ids
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions
        valid_responses = [
            r for r in responses
            if isinstance(r, ModelResponse)
        ]

        return valid_responses

    def _wrap_with_constitution(self, prompt: str, context: Optional[Dict]) -> str:
        """Inject constitutional constraints into prompt"""
        context_str = ""
        if context:
            if "previous_responses" in context:
                context_str = f"\nPREVIOUS RESPONSES:\n{context['previous_responses']}\n"

        return f"""{self.CONSTITUTIONAL_PROMPT}

{context_str}

QUESTION:
{prompt}

Provide your response, ensuring constitutional compliance.
"""

    async def _query_with_retry(
        self,
        model_id: str,
        prompt: str,
        config: ModelConfig,
        max_retries: int
    ) -> Dict:
        """Query model with exponential backoff retry"""
        for attempt in range(max_retries):
            try:
                if config.provider == "anthropic":
                    return await self._query_anthropic(prompt, config)
                elif config.provider == "openai":
                    return await self._query_openai(prompt, config)
                elif config.provider == "google":
                    return await self._query_google(prompt, config)
                elif config.provider == "deepseek":
                    return await self._query_deepseek(prompt, config)
                else:
                    raise ValueError(f"Unknown provider: {config.provider}")

            except Exception as e:
                if attempt == max_retries - 1:
                    raise

                # Exponential backoff
                wait_time = 2 ** attempt
                await asyncio.sleep(wait_time)

    async def _query_anthropic(self, prompt: str, config: ModelConfig) -> Dict:
        """Query Claude via Anthropic API"""
        client = self.clients[config.model]

        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            json={
                "model": config.model,
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        response.raise_for_status()
        data = response.json()

        return {
            "text": data["content"][0]["text"],
            "tokens": data["usage"]["input_tokens"] + data["usage"]["output_tokens"]
        }

    async def _query_openai(self, prompt: str, config: ModelConfig) -> Dict:
        """Query GPT via OpenAI API"""
        client = self.clients[config.model]

        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            json={
                "model": config.model,
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        response.raise_for_status()
        data = response.json()

        return {
            "text": data["choices"][0]["message"]["content"],
            "tokens": data["usage"]["total_tokens"]
        }

    async def _query_google(self, prompt: str, config: ModelConfig) -> Dict:
        """Query Gemini via Google API"""
        client = self.clients[config.model]

        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{config.model}:generateContent",
            json={
                "contents": [
                    {"parts": [{"text": prompt}]}
                ],
                "generationConfig": {
                    "maxOutputTokens": config.max_tokens,
                    "temperature": config.temperature
                }
            }
        )

        response.raise_for_status()
        data = response.json()

        return {
            "text": data["candidates"][0]["content"]["parts"][0]["text"],
            "tokens": data.get("usageMetadata", {}).get("totalTokenCount", 0)
        }

    async def _query_deepseek(self, prompt: str, config: ModelConfig) -> Dict:
        """Query DeepSeek via API"""
        client = self.clients[config.model]

        response = await client.post(
            "https://api.deepseek.com/v1/chat/completions",
            json={
                "model": config.model,
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        response.raise_for_status()
        data = response.json()

        return {
            "text": data["choices"][0]["message"]["content"],
            "tokens": data["usage"]["total_tokens"]
        }

    def _get_headers(self, config: ModelConfig) -> Dict[str, str]:
        """Get API headers for provider"""
        if config.provider == "anthropic":
            return {
                "x-api-key": config.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
        elif config.provider == "openai":
            return {
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json"
            }
        elif config.provider == "google":
            return {
                "Content-Type": "application/json"
            }
        elif config.provider == "deepseek":
            return {
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json"
            }
        return {}

    async def close(self):
        """Close all HTTP clients"""
        for client in self.clients.values():
            await client.aclose()


# Example usage
if __name__ == "__main__":
    import os

    # Configure models
    models = {
        "claude": ModelConfig(
            provider="anthropic",
            model="claude-sonnet-4-5-20250929",
            api_key=os.getenv("ANTHROPIC_API_KEY", ""),
            max_tokens=8192,
            temperature=0.7,
            expertise=["ethics", "architecture"],
            weight=1.2
        ),
        "gpt4": ModelConfig(
            provider="openai",
            model="gpt-4-turbo",
            api_key=os.getenv("OPENAI_API_KEY", ""),
            max_tokens=8192,
            temperature=0.7,
            expertise=["reasoning", "code"],
            weight=1.0
        ),
        "gemini": ModelConfig(
            provider="google",
            model="gemini-2.0-flash",
            api_key=os.getenv("GOOGLE_API_KEY", ""),
            max_tokens=8192,
            temperature=0.7,
            expertise=["research", "creative"],
            weight=1.0
        )
    }

    async def test_router():
        router = ModelRouter(models)

        # Query all models in parallel
        responses = await router.query_all(
            prompt="Should we implement feature X?",
            model_ids=["claude", "gpt4", "gemini"]
        )

        for response in responses:
            print(f"\n{response.model_id}:")
            print(f"  Response: {response.response[:100]}...")
            print(f"  Tokens: {response.tokens}")
            print(f"  Latency: {response.latency_ms}ms")

        await router.close()

    # Run test
    asyncio.run(test_router())
