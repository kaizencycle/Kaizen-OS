from pydantic import BaseModel
import os

class Settings(BaseModel):
    ENV: str = os.getenv("ENV", "dev")
    # API keys (leave blank locally; set in Render/Fly secrets)
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    CLAUDE_API_KEY: str | None = os.getenv("CLAUDE_API_KEY")
    DEEPSEEK_API_KEY: str | None = os.getenv("DEEPSEEK_API_KEY")
    PERPLEXITY_API_KEY: str | None = os.getenv("PERPLEXITY_API_KEY")

    # Feature flags
    ENABLE_REWARDS: bool = os.getenv("ENABLE_REWARDS", "true").lower() == "true"

settings = Settings()

