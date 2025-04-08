# erc20-blacklist-token

# ERC(ensor)-20 Token – Assignment 3 (Public Blockchains FSS 2025)

## Overview

This project is part of Assignment 3 for the **Public Blockchains** course (FSS 2025) at the University of Mannheim.

It extends a standard ERC-20 token with a censorship mechanism that allows the owner and a validator to blacklist and unblacklist addresses.

## Features

- Based on OpenZeppelin ERC-20
- Mints tokens to owner and validator
- Grants validator allowance over owner’s tokens
- Blacklist and unblacklist functionality
- Only owner or validator can manage blacklist
- Transfers to/from blacklisted addresses are blocked
- Emits `Blacklisted` and `UnBlacklisted` events

## Files

- `Token_template.sol` – Main ERC(ensor)-20 contract
- `BaseAssignment.sol` – Provided for DApp validation (do not modify)
- `EmptyValidator.sol` – Optional dummy validator for local testing
