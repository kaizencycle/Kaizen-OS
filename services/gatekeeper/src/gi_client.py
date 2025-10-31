"""GI (Global Integrity) client for checking actor integrity scores."""
import httpx
import os

GI_FLOOR = float(os.getenv("GI_FLOOR", "0.95"))
GI_INDEXER_URL = os.getenv("GI_INDEXER_URL", "https://gic-indexer.onrender.com")

async def get_gi(actor_did: str) -> float:
    """
    Fetch GI score for an actor from the GIC Indexer.
    
    Args:
        actor_did: DID of the actor
        
    Returns:
        GI score (0.0 to 1.0)
        
    Raises:
        httpx.HTTPError: If the request fails
    """
    async with httpx.AsyncClient(timeout=2.0) as client:
        try:
            response = await client.get(
                f"{GI_INDEXER_URL}/gi",
                params={"actor": actor_did}
            )
            response.raise_for_status()
            data = response.json()
            return float(data.get("gi", 0.0))
        except httpx.TimeoutException:
            # Timeout defaults to 0.0 (fail closed)
            return 0.0
        except Exception:
            # Fail closed on any error
            return 0.0

async def assert_gi_ok(actor_did: str):
    """
    Assert that actor's GI meets the floor threshold.
    
    Args:
        actor_did: DID of the actor
        
    Raises:
        ValueError: If GI is below the floor threshold
    """
    gi = await get_gi(actor_did)
    if gi < GI_FLOOR:
        raise ValueError(f"GI below floor ({gi:.3f} < {GI_FLOOR})")
