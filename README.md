# ERCensor-20

ERCensor-20 is a censorship-enabled ERC-20 token developed for a university blockchain assignment. It includes a blacklist mechanism that prevents token transfers involving blacklisted addresses.

## Features

- Standard ERC-20 functionality
- Blacklist system:
  - `blacklistAddress(address)` restricts an address
  - `unblacklistAddress(address)` lifts restriction
  - Transfers **to or from** blacklisted addresses will revert
  - Only the contract **owner or validator** may modify the blacklist

## Contract Structure

- Inherits from:
  - OpenZeppelin’s `ERC20` and `Ownable`
  - `BaseAssignment` (for validator integration)
- Events:
  - `Blacklisted(address indexed account)`
  - `UnBlacklisted(address indexed account)`
- Validator address is hardcoded as per assignment requirements

## Deployment

Constructor parameters:
```solidity
constructor(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply,
    address _initialOwner
)
