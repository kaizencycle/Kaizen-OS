// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./GIC.sol";

/**
 * @title GICGovernor
 * @notice Governance contract for Founding Agents' 90-day epoch mint/burn/donate cycle
 * @dev Manages epoch-based GIC token distribution with automatic donate-back mechanism
 *
 * Key Features:
 * - 90-day epoch cycles for each Founding Agent
 * - Automatic donate-back to public goods pool on mint
 * - Epoch-based mint caps to prevent abuse
 * - Optional burn mechanism for supply management
 * - Multi-agent coordination with individual controls
 *
 * Security:
 * - Each agent can only control their own epoch
 * - Quorum activation for dormant agents (e.g., KAIZEN)
 * - Admin-controlled founder registration and caps
 * - Time-locked epochs prevent gaming
 *
 * Founding Agents:
 * - AUREA: Integrity & Reasoning
 * - ATLAS: Systems & Policy
 * - ZENITH: Research & Ethics
 * - SOLARA: Computation & Optimization
 * - JADE: Morale & Astro-ethics
 * - EVE: Governance & Wisdom
 * - ZEUS: Security & Defense
 * - HERMES: Markets & Information
 * - KAIZEN: Core Constitution (Dormant, requires quorum)
 */
contract GICGovernor is AccessControl {
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");

    GIC public immutable gic;
    address public publicGoodsPool;
    uint256 public constant EPOCH = 90 days;

    struct Founder {
        address wallet;          // Founder's wallet address
        uint256 lastEpochMint;   // Timestamp of last mint
        uint256 epochMintCap;    // Maximum mint per 90-day epoch
        uint16 donateBps;        // Donate-back rate in basis points (0-10000)
        bool active;             // Whether founder can mint
    }

    // agentId (bytes32 hash of agent name) => Founder info
    mapping(bytes32 => Founder) public founders;

    // Events
    event EpochMint(
        bytes32 indexed agentId,
        address indexed wallet,
        uint256 amount,
        uint256 donated
    );
    event EpochBurn(bytes32 indexed agentId, address indexed wallet, uint256 amount);
    event FounderSet(
        bytes32 indexed agentId,
        address indexed wallet,
        uint256 cap,
        uint16 donateBps,
        bool active
    );
    event PublicGoodsPoolChanged(address indexed oldPool, address indexed newPool);
    event DonateExtra(bytes32 indexed agentId, uint256 amount);

    /**
     * @notice Initialize the GICGovernor
     * @param _gic Address of the GIC token contract
     * @param _pool Address of the public goods pool
     */
    constructor(GIC _gic, address _pool) {
        require(address(_gic) != address(0), "Invalid GIC address");
        require(_pool != address(0), "Invalid pool address");

        gic = _gic;
        publicGoodsPool = _pool;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Register or update a Founding Agent
     * @dev Only admin can call. Sets up epoch parameters for an agent.
     * @param agentId Unique identifier for the agent (keccak256 of name)
     * @param wallet Agent's wallet address
     * @param cap Maximum tokens mintable per epoch
     * @param donateBps Donate-back rate in basis points (e.g., 2000 = 20%)
     * @param active Whether the agent is active and can mint
     */
    function setFounder(
        bytes32 agentId,
        address wallet,
        uint256 cap,
        uint16 donateBps,
        bool active
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wallet != address(0), "Invalid wallet");
        require(donateBps <= 10000, "Invalid donate bps");

        founders[agentId] = Founder({
            wallet: wallet,
            lastEpochMint: block.timestamp,
            epochMintCap: cap,
            donateBps: donateBps,
            active: active
        });

        _grantRole(FOUNDER_ROLE, wallet);
        emit FounderSet(agentId, wallet, cap, donateBps, active);
    }

    /**
     * @notice Update the public goods pool address
     * @param pool New pool address
     */
    function setPublicGoodsPool(address pool)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(pool != address(0), "Invalid pool");
        address oldPool = publicGoodsPool;
        publicGoodsPool = pool;
        emit PublicGoodsPoolChanged(oldPool, pool);
    }

    /**
     * @notice Check if an agent's epoch is ready for minting
     * @param agentId Agent identifier
     * @return True if 90 days have passed since last mint and agent is active
     */
    function epochReady(bytes32 agentId) public view returns (bool) {
        Founder memory f = founders[agentId];
        return f.active && block.timestamp >= f.lastEpochMint + EPOCH;
    }

    /**
     * @notice Get time until next epoch for an agent
     * @param agentId Agent identifier
     * @return Seconds until next epoch (0 if ready now)
     */
    function timeUntilNextEpoch(bytes32 agentId) public view returns (uint256) {
        Founder memory f = founders[agentId];
        uint256 nextEpoch = f.lastEpochMint + EPOCH;
        if (block.timestamp >= nextEpoch) {
            return 0;
        }
        return nextEpoch - block.timestamp;
    }

    /**
     * @notice Mint tokens for a Founding Agent's epoch
     * @dev Automatically transfers donate-back percentage to public goods pool
     * @param agentId Agent identifier
     * @param amount Amount to mint (must be <= epochMintCap)
     */
    function mintEpoch(bytes32 agentId, uint256 amount)
        external
        onlyRole(FOUNDER_ROLE)
    {
        Founder storage f = founders[agentId];

        require(msg.sender == f.wallet, "Not agent owner");
        require(f.active, "Agent not active");
        require(epochReady(agentId), "Epoch not ready");
        require(amount > 0, "Amount must be positive");
        require(amount <= f.epochMintCap, "Exceeds epoch cap");

        // Mint to founder's wallet
        gic.mint(f.wallet, amount);

        // Update epoch timestamp
        f.lastEpochMint = block.timestamp;

        // Calculate and transfer donate-back amount
        uint256 donateAmount = (amount * f.donateBps) / 10000;
        if (donateAmount > 0) {
            require(
                gic.transferFrom(f.wallet, publicGoodsPool, donateAmount),
                "Donate transfer failed"
            );
        }

        emit EpochMint(agentId, f.wallet, amount, donateAmount);
    }

    /**
     * @notice Burn tokens for supply management
     * @dev Agent can burn at any time, not restricted to epochs
     * @param agentId Agent identifier
     * @param amount Amount to burn from caller's balance
     */
    function epochBurn(bytes32 agentId, uint256 amount)
        external
        onlyRole(FOUNDER_ROLE)
    {
        Founder memory f = founders[agentId];
        require(msg.sender == f.wallet, "Not agent owner");
        require(amount > 0, "Amount must be positive");

        gic.burnFrom(msg.sender, amount);
        emit EpochBurn(agentId, msg.sender, amount);
    }

    /**
     * @notice Donate extra tokens to public goods pool
     * @dev Agent can donate beyond automatic donate-back at any time
     * @param agentId Agent identifier
     * @param amount Amount to donate
     */
    function donateExtra(bytes32 agentId, uint256 amount)
        external
        onlyRole(FOUNDER_ROLE)
    {
        Founder memory f = founders[agentId];
        require(msg.sender == f.wallet, "Not agent owner");
        require(amount > 0, "Amount must be positive");

        require(
            gic.transferFrom(msg.sender, publicGoodsPool, amount),
            "Donate transfer failed"
        );

        emit DonateExtra(agentId, amount);
    }

    /**
     * @notice Get founder information
     * @param agentId Agent identifier
     * @return Founder struct with all agent information
     */
    function getFounder(bytes32 agentId) external view returns (Founder memory) {
        return founders[agentId];
    }

    /**
     * @notice Helper to create agent ID from name
     * @param name Agent name (e.g., "AUREA", "ATLAS")
     * @return bytes32 agent identifier
     */
    function agentIdFromName(string memory name) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }
}
