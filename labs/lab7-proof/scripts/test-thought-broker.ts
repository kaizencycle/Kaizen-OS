#!/usr/bin/env node
import fetch from "node-fetch";

const BROKER_URL = process.env.BROKER_URL || "http://localhost:8080";

async function testThoughtBroker() {
  console.log("🧠 Testing Thought Broker...\n");

  try {
    // 1. Health check
    console.log("1. Health check...");
    const health = await fetch(`${BROKER_URL}/v1/loop/health`);
    if (!health.ok) throw new Error(`Health check failed: ${health.status}`);
    console.log("✅ Health check passed\n");

    // 2. Start a test loop
    console.log("2. Starting test loop...");
    const startResponse = await fetch(`${BROKER_URL}/v1/loop/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cycle: "TEST-001",
        proposalRef: "/.civic/change.proposal.json",
        specRef: "/.civic/change.spec.md",
        testsRef: "/.civic/change.tests.json",
        goal: "Test the inner dialogue system",
        models: [
          { id: "oaa-llm-a" },
          { id: "oaa-llm-b" },
          { id: "oaa-llm-c" }
        ]
      })
    });

    if (!startResponse.ok) {
      const error = await startResponse.text();
      throw new Error(`Start loop failed: ${error}`);
    }

    const startData = await startResponse.json();
    const loopId = startData.loopId;
    console.log(`✅ Loop started: ${loopId}\n`);

    // 3. Poll for completion
    console.log("3. Polling for completion...");
    let attempts = 0;
    let status = "running";
    
    while (status === "running" && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${BROKER_URL}/v1/loop/${loopId}/status`);
      if (!statusResponse.ok) throw new Error(`Status check failed: ${statusResponse.status}`);
      
      const statusData = await statusResponse.json();
      status = statusData.status;
      console.log(`   Step ${statusData.step}, Score: ${statusData.score}, Status: ${status}`);
      attempts++;
    }

    if (status !== "halted") {
      throw new Error(`Loop did not complete: ${status}`);
    }
    console.log("✅ Loop completed\n");

    // 4. Get consensus
    console.log("4. Retrieving consensus...");
    const consensusResponse = await fetch(`${BROKER_URL}/v1/loop/${loopId}/consensus`);
    if (!consensusResponse.ok) throw new Error(`Consensus retrieval failed: ${consensusResponse.status}`);
    
    const consensusData = await consensusResponse.json();
    console.log("✅ Consensus retrieved:");
    console.log(`   Summary: ${consensusData.consensus.summary}`);
    console.log(`   Score: ${consensusData.consensus.score}`);
    console.log(`   Citations: ${consensusData.consensus.citations.length}`);
    console.log(`   Attestation: ${consensusData.attestRef}\n`);

    // 5. Get audit trail
    console.log("5. Retrieving audit trail...");
    const auditResponse = await fetch(`${BROKER_URL}/v1/loop/${loopId}/audit`);
    if (!auditResponse.ok) throw new Error(`Audit retrieval failed: ${auditResponse.status}`);
    
    const auditData = await auditResponse.json();
    console.log("✅ Audit trail retrieved:");
    console.log(`   Messages: ${auditData.auditTrail.messages.length}`);
    console.log(`   Duration: ${auditData.auditTrail.duration}ms`);
    console.log(`   Status: ${auditData.auditTrail.status}\n`);

    console.log("🎉 All tests passed! Thought Broker is working correctly.");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testThoughtBroker();
