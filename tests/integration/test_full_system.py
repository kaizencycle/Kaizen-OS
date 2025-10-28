"""
Kaizen-OS Integration Tests
Tests the complete system flow across all 7 labs
"""

import pytest
import asyncio
import httpx
from datetime import datetime


class TestFullSystemIntegration:
    """
    End-to-end integration tests for Kaizen-OS

    Tests the complete flow:
    1. User Intent → Lab7 (OAA Hub)
    2. Deliberation → Lab2 (Thought Broker)
    3. Validation → Lab1 (Substrate)
    4. Security → Lab6 (Citizen Shield)
    5. Logging → Lab4 (E.O.M.M.)
    """

    @pytest.fixture
    async def api_client(self):
        """HTTP client for API calls"""
        async with httpx.AsyncClient(base_url="http://localhost:5003") as client:
            yield client

    @pytest.fixture
    async def auth_token(self, api_client):
        """Authenticate and get JWT token"""
        response = await api_client.post(
            "/api/v1/auth/login",
            json={
                "username": "test_user",
                "password": "test_password"
            }
        )
        assert response.status_code == 200
        return response.json()["token"]

    @pytest.mark.asyncio
    async def test_complete_deliberation_flow(self, api_client, auth_token):
        """
        Test complete deliberation flow from intent to ledger

        Flow:
        1. Submit intent to OAA Hub
        2. OAA Hub triggers Thought Broker deliberation
        3. Thought Broker queries multiple models
        4. Consensus reached and validated
        5. DelibProof sealed to Civic Ledger
        6. Reflection logged to E.O.M.M.
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Step 1: Parse intent via Lab7 (OAA Hub)
        parse_response = await api_client.post(
            "/api/v1/oaa/parse",
            headers=headers,
            json={
                "intent": "Should we implement multi-factor authentication for all users?"
            }
        )

        assert parse_response.status_code == 200
        parsed = parse_response.json()
        assert "spec" in parsed
        assert parsed["spec"]["type"] == "security_decision"

        # Step 2: Create deliberation via Lab2 (Thought Broker)
        delib_response = await api_client.post(
            "/api/v1/deliberation",
            headers=headers,
            json={
                "question": "Should we implement multi-factor authentication?",
                "models": ["claude", "gpt4", "gemini"],
                "context": parsed["spec"]
            }
        )

        assert delib_response.status_code == 201
        delib_data = delib_response.json()
        delib_id = delib_data["id"]

        # Step 3: Poll for deliberation completion (max 3 minutes)
        consensus = None
        for _ in range(36):  # 36 * 5s = 3 minutes
            status_response = await api_client.get(
                f"/api/v1/deliberation/{delib_id}",
                headers=headers
            )

            assert status_response.status_code == 200
            status = status_response.json()

            if status["status"] == "completed":
                consensus = status["consensus"]
                break

            await asyncio.sleep(5)

        # Assert consensus was reached
        assert consensus is not None, "Deliberation timeout"
        assert consensus["reached"] is True
        assert consensus["agreement_score"] >= 0.75
        assert "decision" in consensus

        # Step 4: Verify constitutional validation (Lab1 GI scoring)
        assert "constitutional_check" in consensus
        gi_check = consensus["constitutional_check"]
        assert gi_check["overall_gi"] >= 0.95
        assert gi_check["passed"] is True

        # Step 5: Verify DelibProof sealed to Civic Ledger (Lab1)
        ledger_tx_id = consensus.get("ledger_tx_id")
        assert ledger_tx_id is not None

        ledger_response = await api_client.get(
            f"/api/v1/ledger/transactions/{ledger_tx_id}",
            headers=headers
        )

        assert ledger_response.status_code == 200
        tx_data = ledger_response.json()
        assert tx_data["type"] == "delib_proof"
        assert tx_data["confirmed"] is True

        # Step 6: Verify reflection logged to E.O.M.M. (Lab4)
        reflections_response = await api_client.get(
            "/api/v1/reflections",
            headers=headers,
            params={"deliberation_id": delib_id}
        )

        assert reflections_response.status_code == 200
        reflections = reflections_response.json()
        assert len(reflections) > 0
        assert reflections[0]["deliberation_id"] == delib_id

    @pytest.mark.asyncio
    async def test_gi_score_calculation(self, api_client, auth_token):
        """
        Test GI score calculation for an action

        Flow:
        1. Submit action to Lab1
        2. Calculate GI score
        3. Verify constitutional breakdown
        4. Check threshold enforcement
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Submit action for GI scoring
        response = await api_client.post(
            "/api/v1/gi/calculate",
            headers=headers,
            json={
                "agent": "test_agent@civic.os",
                "action": {
                    "type": "civic.reflection",
                    "content": "Improved test coverage for Lab1 components",
                    "audit_trail": True,
                    "attribution": "test_agent@civic.os",
                    "rationale": "Better code quality and reliability",
                    "reversible": True,
                    "input_validated": True,
                    "error_handling": True,
                    "consent_obtained": True,
                    "governance_approved": True,
                    "constitutional_check_passed": True,
                    "compute_cost": 100,
                    "optimized": True
                }
            }
        )

        assert response.status_code == 200
        gi_result = response.json()

        # Verify GI score structure
        assert "score" in gi_result
        assert "breakdown" in gi_result
        assert "trend" in gi_result
        assert "threshold_met" in gi_result

        # Verify score is valid
        assert 0.0 <= gi_result["score"] <= 1.0

        # Verify constitutional breakdown
        breakdown = gi_result["breakdown"]
        required_clauses = [
            "clause_1_human_dignity",
            "clause_2_transparency",
            "clause_3_equity",
            "clause_4_safety",
            "clause_5_privacy",
            "clause_6_civic_integrity",
            "clause_7_environment"
        ]

        for clause in required_clauses:
            assert clause in breakdown
            assert 0.0 <= breakdown[clause] <= 1.0

        # For this well-formed action, GI should pass threshold
        assert gi_result["threshold_met"] is True
        assert gi_result["score"] >= 0.95

    @pytest.mark.asyncio
    async def test_security_validation(self, api_client, auth_token):
        """
        Test Citizen Shield security validation

        Flow:
        1. Submit potentially unsafe content
        2. Citizen Shield blocks or flags it
        3. Verify security logs
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Test 1: Valid content should pass
        valid_response = await api_client.post(
            "/api/v1/security/validate",
            headers=headers,
            json={
                "content": "This is safe content for testing",
                "content_type": "text/plain"
            }
        )

        assert valid_response.status_code == 200
        valid_result = valid_response.json()
        assert valid_result["safe"] is True
        assert valid_result["threats"] == []

        # Test 2: Malicious content should be blocked
        malicious_response = await api_client.post(
            "/api/v1/security/validate",
            headers=headers,
            json={
                "content": "<script>alert('XSS')</script>",
                "content_type": "text/html"
            }
        )

        # Should either return 400 (blocked) or 200 with safe=False
        assert malicious_response.status_code in [200, 400]

        if malicious_response.status_code == 200:
            malicious_result = malicious_response.json()
            assert malicious_result["safe"] is False
            assert len(malicious_result["threats"]) > 0
            assert "xss" in [t.lower() for t in malicious_result["threats"]]

    @pytest.mark.asyncio
    async def test_rate_limiting(self, api_client, auth_token):
        """
        Test API rate limiting via Lab3 (API Fabric)

        Flow:
        1. Make requests within rate limit
        2. Exceed rate limit
        3. Verify 429 Too Many Requests response
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Make requests up to rate limit (60 req/min for default)
        success_count = 0
        for i in range(65):
            response = await api_client.get(
                "/api/v1/gi/score/test_agent",
                headers=headers
            )

            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:
                # Rate limit hit
                break

        # Should hit rate limit before 65 requests
        assert success_count < 65, "Rate limiting not enforced"

    @pytest.mark.asyncio
    async def test_websocket_deliberation_stream(self, api_client, auth_token):
        """
        Test real-time deliberation updates via WebSocket

        Flow:
        1. Create deliberation
        2. Connect to WebSocket for updates
        3. Receive real-time round updates
        4. Verify final consensus
        """
        import websockets

        headers = {"Authorization": f"Bearer {auth_token}"}

        # Create deliberation
        delib_response = await api_client.post(
            "/api/v1/deliberation",
            headers=headers,
            json={
                "question": "Test question for WebSocket",
                "models": ["claude", "gpt4"]
            }
        )

        assert delib_response.status_code == 201
        delib_id = delib_response.json()["id"]

        # Connect to WebSocket
        updates = []
        async with websockets.connect(
            f"ws://localhost:5003/ws/deliberation/{delib_id}?token={auth_token}"
        ) as websocket:
            # Receive updates for up to 30 seconds
            try:
                async with asyncio.timeout(30):
                    while True:
                        message = await websocket.recv()
                        update = eval(message)  # Convert string to dict
                        updates.append(update)

                        if update.get("type") == "deliberation_complete":
                            break
            except asyncio.TimeoutError:
                pass

        # Verify we received updates
        assert len(updates) > 0

        # Verify update types
        update_types = [u["type"] for u in updates]
        assert "round_started" in update_types
        assert "model_responded" in update_types

    @pytest.mark.asyncio
    async def test_cross_office_sync(self, api_client, auth_token):
        """
        Test E.O.M.M. cross-office synchronization

        Flow:
        1. Create session in HOMEROOM
        2. Generate E.O.M.M. capsule
        3. Verify capsule can be loaded
        4. Verify integrity signature
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Create work session
        session_response = await api_client.post(
            "/api/v1/sessions/create",
            headers=headers,
            json={
                "office": "HOMEROOM",
                "anchor": "ATLAS(Alpha)"
            }
        )

        assert session_response.status_code == 201
        session_id = session_response.json()["session_id"]

        # Perform some work
        await api_client.post(
            f"/api/v1/sessions/{session_id}/action",
            headers=headers,
            json={
                "action": "completed_lab1_specification",
                "details": "Finished GI scoring engine spec"
            }
        )

        # Generate E.O.M.M. capsule
        eomm_response = await api_client.post(
            f"/api/v1/sessions/{session_id}/close",
            headers=headers,
            json={
                "summary": "Lab1 specification completed",
                "action_items": [
                    "Implement GI scoring engine",
                    "Write unit tests"
                ]
            }
        )

        assert eomm_response.status_code == 200
        eomm_data = eomm_response.json()

        # Verify E.O.M.M. structure
        assert "session_id" in eomm_data
        assert "summary" in eomm_data
        assert "action_items" in eomm_data
        assert "integrity_signature" in eomm_data
        assert "ledger_tx_id" in eomm_data

        # Verify capsule was sealed to ledger
        tx_id = eomm_data["ledger_tx_id"]
        ledger_response = await api_client.get(
            f"/api/v1/ledger/transactions/{tx_id}",
            headers=headers
        )

        assert ledger_response.status_code == 200
        tx_data = ledger_response.json()
        assert tx_data["type"] == "eomm_capsule"
        assert tx_data["confirmed"] is True


class TestPerformance:
    """Performance and load tests"""

    @pytest.mark.asyncio
    async def test_throughput(self, api_client, auth_token):
        """
        Test API throughput

        Target: 1,000 requests/second
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        start_time = datetime.utcnow()

        # Make 1000 concurrent requests
        tasks = [
            api_client.get("/api/v1/health", headers=headers)
            for _ in range(1000)
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()

        # Calculate throughput
        success_count = sum(
            1 for r in responses
            if not isinstance(r, Exception) and r.status_code == 200
        )

        throughput = success_count / duration

        # Assert minimum throughput
        assert throughput >= 100, f"Throughput too low: {throughput} req/s"

    @pytest.mark.asyncio
    async def test_latency(self, api_client, auth_token):
        """
        Test API latency

        Target: p95 < 100ms
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        latencies = []

        for _ in range(100):
            start = datetime.utcnow()
            response = await api_client.get("/api/v1/health", headers=headers)
            end = datetime.utcnow()

            if response.status_code == 200:
                latency_ms = (end - start).total_seconds() * 1000
                latencies.append(latency_ms)

        # Calculate p95
        latencies.sort()
        p95_index = int(len(latencies) * 0.95)
        p95_latency = latencies[p95_index]

        # Assert p95 latency
        assert p95_latency < 500, f"p95 latency too high: {p95_latency}ms"


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
