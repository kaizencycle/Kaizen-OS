// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GIC (Governance Integrity Credits)
 * @notice ERC-20 token for Kaizen OS governance system
 * @dev Implements role-based minting and burning controlled by GICGovernor
 *
 * Key Features:
 * - Role-based access control for minting and burning
 * - Integration with 90-day epoch system via GICGovernor
 * - Automatic donate-back mechanism on mint
 * - Transparent supply management
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE: Can manage roles and contract settings
 * - MINT_ROLE: Can mint new tokens (typically GICGovernor contract)
 * - BURN_ROLE: Can burn tokens (typically GICGovernor contract)
 */
contract GIC is ERC20, AccessControl {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");

    event MintRoleGranted(address indexed account);
    event BurnRoleGranted(address indexed account);

    /**
     * @notice Initialize the GIC token
     * @dev Sets up ERC-20 with name and symbol, grants admin role to deployer
     */
    constructor() ERC20("Governance Integrity Credits", "GIC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        emit MintRoleGranted(msg.sender);
    }

    /**
     * @notice Mint new GIC tokens
     * @dev Only callable by addresses with MINT_ROLE (typically GICGovernor)
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINT_ROLE) {
        _mint(to, amount);
    }

    /**
     * @notice Burn GIC tokens
     * @dev Only callable by addresses with BURN_ROLE
     * @param amount Amount of tokens to burn from caller's balance
     */
    function burn(uint256 amount) external onlyRole(BURN_ROLE) {
        _burn(msg.sender, amount);
    }

    /**
     * @notice Burn GIC tokens from a specific address
     * @dev Only callable by addresses with BURN_ROLE
     * @param from Address to burn tokens from (requires approval)
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyRole(BURN_ROLE) {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
