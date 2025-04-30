// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBaseValidator {
    function isValidator(address _address) external view returns (bool);

    function setAssignmentCreationBlockNumber() external;

    function setAssignmentOwner() external;
}

contract BaseAssignment {
    address public _owner;
    address public _validator;

    uint256 private _testBlockNumber;

    constructor(address validator) {
        _owner = msg.sender;
        _validator = validator;

        require(
            _validator != address(0),
            "Address of Validator Contract is not set"
        );

        IBaseValidator(_validator).setAssignmentCreationBlockNumber();
        IBaseValidator(_validator).setAssignmentOwner();
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function getBlockNumber() public view returns (uint256) {
        if (isValidator(msg.sender)) return _testBlockNumber;
        else return block.number;
    }

    function isValidator(address _address) public view virtual returns (bool) {
        require(_validator != address(0), "Validator address is not set");
        return IBaseValidator(_validator).isValidator(_address);
    }

    function setBlockNumber(uint256 blockNumber) public {
        require(
            IBaseValidator(_validator).isValidator(msg.sender),
            "BaseAssignment: setBlockNumber: Only validator can call this function"
        );
        _testBlockNumber = blockNumber;
    }

    struct Signature {
        bytes signature;
        uint256 ethAmount;
    }

    mapping(uint256 => Signature) public signatures;

    function addSignature(
        uint256 index,
        bytes memory signature,
        uint256 ethAmount
    ) public {
        require(
            IBaseValidator(_validator).isValidator(msg.sender) ||
                msg.sender == _owner,
            "BaseAssignment: addSignature: Only validator or owner can call this function"
        );
        require(
            index >= 0 && index < 5,
            "Index out of range. Only 5 signatures allowed (index 0 to 4)"
        );
        signatures[index] = Signature(signature, ethAmount);
    }

    function getSignature(uint256 index) public view returns (bytes memory) {
        require(
            IBaseValidator(_validator).isValidator(msg.sender) ||
                msg.sender == _owner,
            "BaseAssignment: getSignature: Only validator or owner can call this function"
        );
        return signatures[index].signature;
    }

    function getSignatureEthAmount(uint256 index)
        public
        view
        returns (uint256)
    {
        require(
            IBaseValidator(_validator).isValidator(msg.sender) ||
                msg.sender == _owner,
            "BaseAssignment: getSignatureEthAmount: Only validator or owner can call this function"
        );
        return signatures[index].ethAmount;
    }
}
