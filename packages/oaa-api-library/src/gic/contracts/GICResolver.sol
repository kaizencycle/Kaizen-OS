// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGICRegistry {
  struct Domain { address owner; string ipfsHash; bytes32 integrityProof; uint256 expiresAt; }
  function getDomain(string memory name) external view returns (Domain memory);
}

contract GICResolver {
    IGICRegistry public registry;
    constructor(address reg) { registry = IGICRegistry(reg); }
    function resolve(string memory name) external view returns (IGICRegistry.Domain memory) {
        return registry.getDomain(name);
    }
}
