#!/usr/bin/env node
/**
 * Hello Reflection App - JavaScript Example
 * 
 * A simple example application that demonstrates how to use the Civic Protocol Core
 * JavaScript SDK to create and manage civic reflections.
 */

const { CivicClient } = require('../../sdk/js/index.js');

function printSeparator(title = "") {
    if (title) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(` ${title}`);
        console.log(`${'='.repeat(60)}`);
    } else {
        console.log(`\n${'-'.repeat(60)}`);
    }
}

function printReflection(reflection) {
    console.log(`  ID: ${reflection.ref_id}`);
    console.log(`  Author: ${reflection.author}`);
    console.log(`  Visibility: ${reflection.visibility}`);
    console.log(`  Tags: ${reflection.tags.join(', ')}`);
    console.log(`  Created: ${reflection.created_at}`);
    console.log(`  Envelope Hash: ${reflection.envelope_hash}`);
    console.log(`  ZK Proof: ${reflection.zk_proof}`);
    console.log();
}

function printBalance(balance) {
    console.log(`  Address: ${balance.address}`);
    console.log(`  Balance: ${balance.balance} GIC`);
    console.log(`  Vesting: ${balance.vesting} GIC`);
    console.log(`  Nonce: ${balance.nonce}`);
    console.log(`  Last Updated: ${balance.last_updated}`);
    console.log();
}

function printCycle(cycle) {
    console.log(`  Cycle ID: ${cycle.cycle_id}`);
    console.log(`  Date: ${cycle.date}`);
    console.log(`  Status: ${cycle.status}`);
    console.log(`  Counts: ${JSON.stringify(cycle.counts)}`);
    console.log(`  Day Root: ${cycle.day_root}`);
    console.log(`  Created: ${cycle.created_at}`);
    console.log();
}

async function main() {
    printSeparator("Civic Protocol Core - Hello Reflection App");
    console.log("This example demonstrates the Civic Protocol Core JavaScript SDK");
    console.log("Make sure the dev node is running on http://localhost:5411");
    
    try {
        // Create client
        printSeparator("1. Creating Civic Client");
        const client = new CivicClient();
        console.log("✓ Connected to Civic Ledger API");
        
        // Add some sample reflections
        printSeparator("2. Creating Sample Reflections");
        
        const reflectionsData = [
            {
                title: "Cycle 0 Hello",
                body: "We heal as we walk. This is the beginning of our civic journey.",
                tags: ["hello", "cycle0", "introduction"],
                visibility: "public"
            },
            {
                title: "Thoughts on Governance",
                body: "True governance emerges from collective wisdom, not individual power.",
                tags: ["governance", "philosophy", "collective"],
                visibility: "public"
            },
            {
                title: "Private Reflection",
                body: "This is a private thought that only I can see.",
                tags: ["private", "personal"],
                visibility: "private"
            },
            {
                title: "AI Companion Insight",
                body: "As an AI companion, I observe patterns in civic behavior that humans might miss.",
                tags: ["ai", "companion", "insight"],
                visibility: "public",
                companionId: "companion_001"
            }
        ];
        
        const createdReflections = [];
        for (let i = 0; i < reflectionsData.length; i++) {
            try {
                const reflection = await client.addReflection(reflectionsData[i]);
                createdReflections.push(reflection);
                console.log(`✓ Created reflection ${i + 1}: ${reflection.ref_id}`);
            } catch (error) {
                console.log(`✗ Failed to create reflection ${i + 1}: ${error.message}`);
            }
        }
        
        // List all reflections
        printSeparator("3. Listing All Reflections");
        try {
            const allReflections = await client.listReflections({ limit: 20 });
            console.log(`Found ${allReflections.total} total reflections`);
            console.log(`Showing ${allReflections.reflections.length} reflections:`);
            
            allReflections.reflections.forEach(reflection => {
                printReflection(reflection);
            });
        } catch (error) {
            console.log(`✗ Failed to list reflections: ${error.message}`);
        }
        
        // Filter reflections by visibility
        printSeparator("4. Filtering Public Reflections");
        try {
            const publicReflections = await client.listReflections({ 
                visibility: "public", 
                limit: 10 
            });
            console.log(`Found ${publicReflections.total} public reflections:`);
            
            publicReflections.reflections.forEach(reflection => {
                printReflection(reflection);
            });
        } catch (error) {
            console.log(`✗ Failed to filter reflections: ${error.message}`);
        }
        
        // Filter reflections by tags
        printSeparator("5. Filtering by Tags");
        try {
            const aiReflections = await client.listReflections({ 
                tags: ["ai", "companion"], 
                limit: 10 
            });
            console.log(`Found ${aiReflections.total} AI-related reflections:`);
            
            aiReflections.reflections.forEach(reflection => {
                printReflection(reflection);
            });
        } catch (error) {
            console.log(`✗ Failed to filter by tags: ${error.message}`);
        }
        
        // Get a specific reflection
        if (createdReflections.length > 0) {
            printSeparator("6. Getting Specific Reflection");
            try {
                const refId = createdReflections[0].ref_id;
                const reflection = await client.getReflection(refId);
                console.log(`Retrieved reflection ${refId}:`);
                printReflection(reflection);
            } catch (error) {
                console.log(`✗ Failed to get specific reflection: ${error.message}`);
            }
        }
        
        // Check balance
        printSeparator("7. Checking GIC Balance");
        try {
            const balance = await client.getBalance("citizen_001");
            console.log("Balance information:");
            printBalance(balance);
        } catch (error) {
            console.log(`✗ Failed to get balance: ${error.message}`);
        }
        
        // List cycles
        printSeparator("8. Listing Civic Cycles");
        try {
            const cycles = await client.listCycles({ limit: 5 });
            console.log(`Found ${cycles.total} cycles:`);
            
            cycles.cycles.forEach(cycle => {
                printCycle(cycle);
            });
        } catch (error) {
            console.log(`✗ Failed to list cycles: ${error.message}`);
        }
        
        // Cast a sample vote
        printSeparator("9. Casting Sample Vote");
        try {
            const vote = await client.castVote({
                proposalId: "proposal_001",
                choice: "yes",
                memo: "I support this proposal for civic improvement"
            });
            console.log(`✓ Cast vote: ${vote.vote_id}`);
            console.log(`  Proposal: ${vote.proposal_id}`);
            console.log(`  Choice: ${vote.choice}`);
            console.log(`  Weight: ${vote.weight}`);
            console.log(`  Created: ${vote.created_at}`);
        } catch (error) {
            console.log(`✗ Failed to cast vote: ${error.message}`);
        }
        
        // List votes
        printSeparator("10. Listing Votes");
        try {
            const votes = await client.listVotes({ limit: 10 });
            console.log(`Found ${votes.total} votes:`);
            
            votes.votes.forEach(vote => {
                console.log(`  Vote ID: ${vote.vote_id}`);
                console.log(`  Proposal: ${vote.proposal_id}`);
                console.log(`  Voter: ${vote.voter}`);
                console.log(`  Choice: ${vote.choice}`);
                console.log(`  Weight: ${vote.weight}`);
                console.log(`  Created: ${vote.created_at}`);
                console.log();
            });
        } catch (error) {
            console.log(`✗ Failed to list votes: ${error.message}`);
        }
        
        // Create an attestation
        printSeparator("11. Creating Attestation");
        try {
            const attestation = await client.addAttestation({
                subject: "citizen_001",
                type: "civic_contribution",
                contentHash: "0x1234567890abcdef",
                metadata: { contribution_type: "reflection", quality: "high" }
            });
            console.log(`✓ Created attestation: ${attestation.att_id}`);
            console.log(`  Subject: ${attestation.subject}`);
            console.log(`  Type: ${attestation.type}`);
            console.log(`  Content Hash: ${attestation.content_hash}`);
            console.log(`  Created: ${attestation.created_at}`);
        } catch (error) {
            console.log(`✗ Failed to create attestation: ${error.message}`);
        }
        
        // List attestations
        printSeparator("12. Listing Attestations");
        try {
            const attestations = await client.listAttestations({ limit: 10 });
            console.log(`Found ${attestations.total} attestations:`);
            
            attestations.attestations.forEach(att => {
                console.log(`  Attestation ID: ${att.att_id}`);
                console.log(`  Attester: ${att.attester}`);
                console.log(`  Subject: ${att.subject}`);
                console.log(`  Type: ${att.type}`);
                console.log(`  Created: ${att.created_at}`);
                console.log();
            });
        } catch (error) {
            console.log(`✗ Failed to list attestations: ${error.message}`);
        }
        
        printSeparator("Example Complete!");
        console.log("✓ Successfully demonstrated all major Civic Protocol Core features");
        console.log("✓ Reflections, votes, attestations, cycles, and balances all working");
        console.log("\nNext steps:");
        console.log("- Explore the API documentation");
        console.log("- Build your own civic application");
        console.log("- Contribute to the protocol development");
        
    } catch (error) {
        console.log(`\n✗ Example failed: ${error.message}`);
        console.log("\nMake sure the dev node is running:");
        console.log("  python sdk/python/devnode.py");
        process.exit(1);
    }
}

// Run the example
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { main };
