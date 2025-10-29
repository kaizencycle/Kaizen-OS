/**
 * Deploy GIC Token and GICGovernor contracts
 * Sets up the 90-day epoch system for Founding Agents
 */

import { ethers } from "hardhat";

// Founding Agent configuration
const FOUNDING_AGENTS = [
  {
    name: "AUREA",
    wallet: process.env.AUREA_WALLET || "0x0000000000000000000000000000000000000001",
    cap: ethers.parseEther("100000"), // 100k GIC per epoch
    donateBps: 2000, // 20% donate-back
    active: true,
  },
  {
    name: "ATLAS",
    wallet: process.env.ATLAS_WALLET || "0x0000000000000000000000000000000000000002",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "ZENITH",
    wallet: process.env.ZENITH_WALLET || "0x0000000000000000000000000000000000000003",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "SOLARA",
    wallet: process.env.SOLARA_WALLET || "0x0000000000000000000000000000000000000004",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "JADE",
    wallet: process.env.JADE_WALLET || "0x0000000000000000000000000000000000000005",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "EVE",
    wallet: process.env.EVE_WALLET || "0x0000000000000000000000000000000000000006",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "ZEUS",
    wallet: process.env.ZEUS_WALLET || "0x0000000000000000000000000000000000000007",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "HERMES",
    wallet: process.env.HERMES_WALLET || "0x0000000000000000000000000000000000000008",
    cap: ethers.parseEther("100000"),
    donateBps: 2000,
    active: true,
  },
  {
    name: "KAIZEN",
    wallet: process.env.KAIZEN_WALLET || "0x0000000000000000000000000000000000000009",
    cap: 0, // Dormant - no minting until quorum activation
    donateBps: 0,
    active: true, // Active but dormant (can't mint with 0 cap)
  },
];

async function main() {
  console.log("Deploying GIC Token and GICGovernor...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // 1. Deploy GIC Token
  console.log("\n1. Deploying GIC Token...");
  const GIC = await ethers.getContractFactory("GIC");
  const gic = await GIC.deploy();
  await gic.waitForDeployment();
  const gicAddress = await gic.getAddress();
  console.log("✓ GIC Token deployed to:", gicAddress);

  // 2. Deploy GICGovernor
  console.log("\n2. Deploying GICGovernor...");
  const publicGoodsPool = process.env.PUBLIC_GOODS_POOL || deployer.address;
  console.log("Public Goods Pool:", publicGoodsPool);

  const GICGovernor = await ethers.getContractFactory("GICGovernor");
  const governor = await GICGovernor.deploy(gicAddress, publicGoodsPool);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("✓ GICGovernor deployed to:", governorAddress);

  // 3. Grant roles
  console.log("\n3. Granting roles...");
  const MINT_ROLE = await gic.MINT_ROLE();
  const BURN_ROLE = await gic.BURN_ROLE();

  let tx = await gic.grantRole(MINT_ROLE, governorAddress);
  await tx.wait();
  console.log("✓ Granted MINT_ROLE to GICGovernor");

  tx = await gic.grantRole(BURN_ROLE, governorAddress);
  await tx.wait();
  console.log("✓ Granted BURN_ROLE to GICGovernor");

  // 4. Register Founding Agents
  console.log("\n4. Registering Founding Agents...");
  for (const agent of FOUNDING_AGENTS) {
    const agentId = ethers.keccak256(ethers.toUtf8Bytes(agent.name));
    console.log(`\nRegistering ${agent.name}...`);
    console.log(`  Wallet: ${agent.wallet}`);
    console.log(`  Cap: ${ethers.formatEther(agent.cap)} GIC`);
    console.log(`  Donate: ${agent.donateBps / 100}%`);
    console.log(`  Status: ${agent.active ? "Active" : "Inactive"}${agent.cap === 0n ? " (Dormant)" : ""}`);

    tx = await governor.setFounder(
      agentId,
      agent.wallet,
      agent.cap,
      agent.donateBps,
      agent.active
    );
    await tx.wait();
    console.log(`✓ ${agent.name} registered`);
  }

  // 5. Verification info
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  GIC Token:      ", gicAddress);
  console.log("  GICGovernor:    ", governorAddress);
  console.log("  Public Goods:   ", publicGoodsPool);

  console.log("\nVerification Commands:");
  console.log(`  npx hardhat verify --network <network> ${gicAddress}`);
  console.log(`  npx hardhat verify --network <network> ${governorAddress} "${gicAddress}" "${publicGoodsPool}"`);

  console.log("\nNext Steps:");
  console.log("  1. Update .env with deployed addresses");
  console.log("  2. Configure agent wallets (or use multisig)");
  console.log("  3. Verify contracts on block explorer");
  console.log("  4. Test epoch minting with a founder");
  console.log("  5. Set up Consensus Chamber for KAIZEN quorum activation");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      gic: gicAddress,
      governor: governorAddress,
    },
    publicGoodsPool,
    foundingAgents: FOUNDING_AGENTS.map(a => ({
      name: a.name,
      agentId: ethers.keccak256(ethers.toUtf8Bytes(a.name)),
      wallet: a.wallet,
    })),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✓ Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
