// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// 匯入 OpenZeppelin 提供的標準 ERC20 代幣合約與權限管理 Ownable 模組
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./BaseAssignment.sol";
import "hardhat/console.sol";

// 建立一個 ERC20 合約，名為 CensorableToken，繼承 ERC20 與 Ownable（只有 owner 可做管理行為）
contract CensorableToken is ERC20, Ownable, BaseAssignment {
    // 宣告一個 mapping：紀錄哪些地址是黑名單
    mapping(address => bool) private blacklist;

    // 事件：封鎖地址時會發送
    event Blacklisted(address indexed account);

    // 事件：解封地址時會發送
    event Unblacklisted(address indexed account);

    // 修飾子：限制某些函式只能對「非黑名單地址」執行
    modifier notBlacklisted(address account) {
        require(!blacklist[account], "Address is blacklisted");
        _;
    }

    // 建構式：部署時呼叫一次，用來初始化代幣與驗證合約地址
    constructor(address validatorContract, address validatorAccount)
        ERC20("CensorableToken", "CT")              // 初始化 ERC20 名稱與代號
        Ownable(msg.sender)                         // 設定部署者為 owner（權限控制用）
        BaseAssignment(validatorContract)           // 傳入 Validator 合約地址，讓 BaseAssignment 做紀錄
    {
        // 1. 給部署者 mint 100 顆代幣
        _mint(msg.sender, 100 * 10 ** decimals());

        // 2. 把其中 10 顆轉給 validator 的帳號（用來測試黑名單轉帳）
        _transfer(msg.sender, validatorAccount, 10 * 10 ** decimals());

        // 3. 授權 validator 的帳號可以花 owner 剩下的 90 顆（給 A2 測試用）
        _approve(msg.sender, validatorAccount, 90 * 10 ** decimals());
    }



    // 封鎖某個地址（只有合約 owner 可以執行）
    function blacklistAddress(address account) public onlyOwner {
        blacklist[account] = true;
        emit Blacklisted(account); // 送出黑名單事件（Task E 會用）
        console.log("emitted Blacklisted for", account); // <<== 需要安裝 hardhat console
    }

    // 解封某個地址（只有合約 owner 可以執行）
    function unblacklistAddress(address account) public onlyOwner {
        blacklist[account] = false;
        emit Unblacklisted(account); // 送出解封事件（Task E 會用）
        console.log("emitted Unblacklisted for", account); // <<== 需要安裝 hardhat console
    }

    // 這是內部函式，會在 transfer 前自動呼叫。這邊加上黑名單邏輯做攔截。
    function _update(address from, address to, uint256 value) internal override {
        require(!blacklist[from], "Sender is blacklisted"); // 檢查：如果發送者（from）在黑名單中，就禁止這筆交易
        require(!blacklist[to], "Recipient is blacklisted"); // 檢查：如果接收者（to）在黑名單中，也禁止這筆交易
        super._update(from, to, value); // 呼叫 ERC20 的 transfer 邏輯
    }

    // 檢查某個地址是否在黑名單中（Task B、C、E 要用）
    function isBlacklisted(address account) public view returns (bool) {
        return blacklist[account];
    }

}
