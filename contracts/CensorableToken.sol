// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BaseAssignment.sol";

contract CensorableToken is ERC20, Ownable, BaseAssignment {
    mapping(address => bool) public isBlacklisted;

    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);


    modifier onlyOwnerOrValidator() {
        require(msg.sender == owner() || isValidator(msg.sender), "Not authorized");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address initialOwner,
        address validator
    )
        ERC20(_name, _symbol)
        Ownable(initialOwner)
        BaseAssignment(validator)
    {
        uint8 decimals_ = decimals();
        _mint(initialOwner, _initialSupply * 10 ** decimals_);
        _mint(validator, 10 * 10 ** decimals_);
        _approve(initialOwner, validator, balanceOf(initialOwner));
    }


    function blacklistAddress(address account) public onlyOwnerOrValidator {
        require(!isBlacklisted[account], "Already blacklisted");
        isBlacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklistAddress(address account) public onlyOwnerOrValidator {
        require(isBlacklisted[account], "Not blacklisted");
        isBlacklisted[account] = false;
        emit UnBlacklisted(account);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(!isBlacklisted[msg.sender], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(!isBlacklisted[from], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");
        return super.transferFrom(from, to, amount);
    }

    function isValidator(address addr) public view override returns (bool) {
        return addr == getOwner() || BaseAssignment.isValidator(addr);
    }


}
