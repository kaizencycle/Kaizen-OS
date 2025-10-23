// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GICRegistry is Ownable, Pausable {
    using Strings for uint256;

    struct Domain {
        address owner;
        string  ipfsHash;
        bytes32 integrityProof;
        uint256 expiresAt;
    }

    uint256 public basePriceWei = 0.01 ether;
    uint256 public renewalSeconds = 90 days;
    address public treasury;

    mapping(string => Domain) private domains;

    event Registered(string indexed name, address indexed owner, uint256 expiresAt);
    event Renewed(string indexed name, uint256 newExpiry);
    event RecordsUpdated(string indexed name, string ipfsHash, bytes32 integrityProof);
    event OwnershipTransferredOnName(string indexed name, address indexed oldOwner, address indexed newOwner);
    event ParamsUpdated(uint256 priceWei, uint256 renewalSeconds, address treasury);

    modifier onlyNameOwner(string memory name) {
        require(domains[name].owner == msg.sender, "not_owner");
        _;
    }

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "treasury_zero");
        treasury = _treasury;
    }

    function setParams(uint256 _priceWei, uint256 _renewalSeconds, address _treasury) external onlyOwner {
        require(_treasury != address(0), "treasury_zero");
        basePriceWei = _priceWei;
        renewalSeconds = _renewalSeconds;
        treasury = _treasury;
        emit ParamsUpdated(_priceWei, _renewalSeconds, _treasury);
    }

    function getDomain(string memory name) external view returns (Domain memory) {
        return domains[name];
    }

    function isAvailable(string memory name) public view returns (bool) {
        Domain storage d = domains[name];
        return d.owner == address(0) || block.timestamp > d.expiresAt;
    }

    function _validateLabel(string memory name) internal pure {
        bytes memory b = bytes(name);
        require(b.length >= 1 && b.length <= 63, "label_len");
        for (uint i=0;i<b.length;i++){
            bytes1 c = b[i];
            bool ok = (c >= 0x61 && c <= 0x7A) || (c >= 0x30 && c <= 0x39) || (c == 0x2D);
            require(ok, "label_chars");
            if (i==0 || i==b.length-1) require(c != 0x2D, "dash_edge");
        }
    }

    function register(string calldata name, string calldata ipfsHash, bytes32 integrityProof) external payable whenNotPaused {
        _validateLabel(name);
        require(isAvailable(name), "taken");
        require(msg.value >= basePriceWei, "fee_low");

        domains[name] = Domain({
            owner: msg.sender,
            ipfsHash: ipfsHash,
            integrityProof: integrityProof,
            expiresAt: block.timestamp + renewalSeconds
        });

        (bool s,) = payable(treasury).call{value: msg.value}("");
        require(s, "pay_fail");
        emit Registered(name, msg.sender, domains[name].expiresAt);
        emit RecordsUpdated(name, ipfsHash, integrityProof);
    }

    function renew(string calldata name) external payable whenNotPaused {
        Domain storage d = domains[name];
        require(d.owner != address(0), "no_domain");
        require(msg.value >= basePriceWei / 10, "fee_low");

        uint256 start = block.timestamp > d.expiresAt ? block.timestamp : d.expiresAt;
        d.expiresAt = start + renewalSeconds;

        (bool s,) = payable(treasury).call{value: msg.value}("");
        require(s, "pay_fail");
        emit Renewed(name, d.expiresAt);
    }

    function updateRecords(string calldata name, string calldata ipfsHash, bytes32 integrityProof) external onlyNameOwner(name) whenNotPaused {
        Domain storage d = domains[name];
        require(d.owner != address(0), "no_domain");
        d.ipfsHash = ipfsHash;
        d.integrityProof = integrityProof;
        emit RecordsUpdated(name, ipfsHash, integrityProof);
    }

    function transferName(string calldata name, address newOwner) external onlyNameOwner(name) whenNotPaused {
        require(newOwner != address(0), "zero_owner");
        address old = domains[name].owner;
        domains[name].owner = newOwner;
        emit OwnershipTransferredOnName(name, old, newOwner);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
