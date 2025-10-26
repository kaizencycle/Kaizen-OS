from pydantic import BaseModel
import os

class Settings(BaseModel):
    DB_URL: str = os.getenv("GIC_DB_URL", "sqlite:///./gic.db")
    API_KEY: str | None = os.getenv("GIC_API_KEY")
    XP_TO_GIC_RATIO: float = float(os.getenv("GIC_XP_TO_GIC_RATIO", "0.001"))
    CORS_ALLOW_ORIGINS: str = os.getenv("CORS_ALLOW_ORIGINS", "*")

settings = Settings()

