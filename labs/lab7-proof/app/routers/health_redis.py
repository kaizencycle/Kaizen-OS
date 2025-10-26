# app/routers/health_redis.py
from fastapi import APIRouter
from app.utils.nonce_store import get_redis

router = APIRouter()

@router.get("/_health/redis")
async def redis_health():
    try:
        r = await get_redis()
        pong = await r.ping()
        return {"ok": bool(pong)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

