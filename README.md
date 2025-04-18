# ERCensor-20

ERCensor-20 is a censorship-enabled ERC-20 token developed as part of a university blockchain assignment. It features a blacklist mechanism that restricts token transfers to or from specified addresses.

## Features

- Standard ERC-20 functionality (transfer, approve, balanceOf, etc.)
- Blacklist functionality:
  - `blacklistAddress(address)` to restrict an address
  - `unblacklistAddress(address)` to lift restriction
  - Transfers from/to blacklisted addresses are blocked
  - Only the contract owner can modify the blacklist

## Contract Structure

- Inherits from OpenZeppelin's `ERC20` and `Ownable`
- Inherits from `BaseAssignment` for validator interaction
- Emits `Blacklisted(address)` and `Unblacklisted(address)` events

## Deployment

The contract constructor requires two parameters:
- `address validatorContract`: Deployed validator contract (e.g., `EmptyValidator`)
- `address validatorAccount`: Account to receive 10 tokens and get approval to spend 90

At deployment:
- Deployer receives 100 tokens
- 10 tokens are transferred to the validator account
- Validator is approved to spend the remaining 90

## Testing

Run the test flow with:

```bash
npx hardhat node
npx hardhat run scripts/deploy.cjs --network localhost
node scripts/testToken.js
