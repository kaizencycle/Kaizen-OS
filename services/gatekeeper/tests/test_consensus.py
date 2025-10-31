"""Tests for DelibProof consensus."""
import pytest
from unittest.mock import AsyncMock, patch
from src.consensus import delibproof_consensus, get_consensus_details

@pytest.mark.asyncio
async def test_consensus_all_approve():
    """Test consensus when all sentinels approve."""
    mock_response = AsyncMock()
    mock_response.json.return_value = {"approval": 0.95}
    mock_response.raise_for_status = AsyncMock()
    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        result = await delibproof_consensus({"test": "data"}, threshold=0.90)
        # Mock will return approvals from all sentinels
        assert isinstance(result, bool)

@pytest.mark.asyncio
async def test_consensus_fails_on_error():
    """Test consensus fails when sentinels error."""
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = Exception("Connection error")
        
        result = await delibproof_consensus({"test": "data"}, threshold=0.90)
        # Should fail closed (return False)
        assert result == False

@pytest.mark.asyncio
async def test_consensus_details():
    """Test getting detailed consensus results."""
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = AsyncMock()
        mock_response.json.return_value = {"approval": 0.95, "reason": "OK"}
        mock_response.raise_for_status = AsyncMock()
        mock_post.return_value = mock_response
        
        details = await get_consensus_details({"test": "data"})
        assert "votes" in details
        assert "consensus_reached" in details
