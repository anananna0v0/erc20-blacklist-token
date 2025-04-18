// Tester file for Assignment 3.
////////////////////////////////

// Uncomment the function calls for the task you want to test
// and then run the entire file.

// Do not forget to update contract address and path to ABI.

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { ethers } from "ethers";

// 連線到本地 hardhat 節點
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 拿帳號出來（跟 hardhat node 一樣）// Hardhat 本地節點 (npx hardhat node) 啟動時自動提供的 20 個測試帳號，每個都有 10000 ETH 可以用來做測試用
const signer1 = await provider.getSigner(0); // 第 0 個帳號（通常是部署者、owner）
const signer2 = await provider.getSigner(1); // 第 1 個帳號（可以當作測試對象，例如黑名單用）
const signer3 = await provider.getSigner(2); // 第 2 個帳號（你之前當作 signer 使用者測試）

async function main() {
    // Retrieve signers from Hardhat (as defined in the hardhat.config.js file).
    // const [signer1, signer2, signer3] = await ethers.getSigners();

    // Pick the deployer (default is signer1).
    const signer = signer1;
    console.log("Deployer of contract is:", signer.address);


    // Contract.
    ////////////

    // Contract address.
    const contractAddr = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";

    // Locate ABI as created by Hardhat after compilation/deployment.
    // (adjust names and path accordingly).
    const pathToABI = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "CensorableToken.sol",   
      "CensorableToken.json"
  );
  
    // console.log(pathToABI);

    const ABI = require(pathToABI).abi;
    // console.log(ABI);

    // Create contract with attached signer.
    const contract = new ethers.Contract(contractAddr, ABI, signer);

    // Addresses.
    /////////////

    // Owner.
    const owner = signer.address;
    // console.log(owner);
    
    // If owner is defined in your contract check that it is the same as above.
    // console.log("Owner is ", await contract.owner());

    // Address used for blacklisting.
    const testSigner = signer2;
    const testAddr = testSigner.address;
    // console.log('TEST ADDRESS: ', testAddr);

    // Validator address
    // (or any other address, not actually used for validation here).
    const validatorAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // TASK A.
    //////////

    const taskA1 = async function () {
        console.log("TASK A1");
        ///////////////////////

        // Check balances.
        let balVal = await contract.balanceOf(validatorAddr);
        console.log("Balance validator", ethers.formatEther(balVal));
        let balOwner = await contract.balanceOf(owner);
        console.log("Balance owner", ethers.formatEther(balOwner));

        const expectedBalVal = ethers.parseEther('10');

        if (balVal !== expectedBalVal) {
            console.info("  Error! Balance of validator is not 10.");
        } else {
            console.error("  OK! Balance of validator is 10.");
        }

        const totalSupply = await contract.totalSupply();

        if (balOwner !== totalSupply - expectedBalVal) {
            console.info("  Error! Balance of owner is not totalSupply - 10.");
        } else {
            console.error("  OK! Balance of validator is totalSupply - 10.");
        }
    };

    await taskA1(); // 檢查 validator & owner 餘額：是否 mint 給 validator 10 tokens、給 owner 剩下的（應該是 90）

    const taskA2 = async function () {
      console.log("TASK A2");
      ///////////////////////

      let allowance = await contract.allowance(owner, validatorAddr);
      console.log("Allowance of validator on owner", ethers.formatEther(allowance));

      const expectedAll = await contract.totalSupply() - ethers.parseEther('10');

      if (expectedAll !== allowance) {
          console.info("  Error! Allowance of validator is not totalSupply - 10.");
      } else {
          console.error("  OK! Allowance of validator is totalSupply - 10.");
      }

    };

    await taskA2(); // 檢查 validator 的 allowance：是否正確授權 validator 可操作 owner 的 token（90 tokens）

    // TASK B and C.
    ////////////////

    // Parameters:
    //
    // addr: the address to test
    // cb: a callback to call after un/blacklisting.
    //
    // Note: callbacks are called also in case of errors.
    //
    async function taskBandC(addr, cb) {
        let bl = await contract.isBlacklisted(addr);
        if (bl) {
            console.log("Address is already blacklisted, undoing it.");
            let tx = await contract.unblacklistAddress(addr);
            await tx.wait();
            bl = await contract.isBlacklisted(addr);
            
            if (bl) console.log("  Error! Unblacklisting did not work!");
            else console.log("  OK! Unblacklisting worked!");            
        } else {
            console.log("Address is not blacklisted, adding it to the list.");
            let tx = await contract.blacklistAddress(addr);
            await tx.wait();
            bl = await contract.isBlacklisted(addr);

            if (bl) console.log("  OK! Blacklisting worked!");
            else console.log("  Error! Blacklisting did not work!");
        }

        if (cb) await cb(addr, bl);
    };

    console.log("TASK B");
    await taskBandC(testAddr); // TaskB：測試黑名單功能有沒有正常運作（把某個地址加到黑名單、或從黑名單移除）

    console.log("TASK C");
    await taskBandC(testAddr, taskDcb); // TaskC：測試黑名單地址是否能夠接收轉帳（應該要失敗）
    
    // TASK D.
    //////////

    async function taskDcb(addr, isBlacklisted) {
      
      let tx;

      // Transaction TO blacklisted.
      try {
        tx = await contract.transfer(addr, ethers.parseEther("1"));
        await tx.wait();
        if (isBlacklisted) {
          console.log("  Error! Transaction to blacklisted address did not revert!");
        }
        else {
          console.log("  OK! Transaction to non-blacklisted address did not revert!");
        }
      }
      catch(e) {
        if (isBlacklisted) {
          console.log("  OK! Transaction to blacklisted address reverted!");
        }
        else {
          console.log("  Error! Transaction to non-blacklisted address reverted!");
        }
      }

    };

    async function taskDcbFrom(addr) {
      
      const isBlacklisted = await contract.isBlacklisted(addr);
      
      // Transfer some tokens to testAddr and the blacklist it.
      if (!isBlacklisted) {
        console.log('Address is not blacklisted, transferring Ether and blacklisting')
        let tx = await contract.transfer(addr, ethers.parseEther("1"));
        await tx.wait();
        tx = await contract.blacklistAddress(addr);
        await tx.wait();
      }
      else {
        console.log('Address is already blacklisted.')
      }
      
      
      // Create contract with testSigner.
      const contractFrom = new ethers.Contract(contractAddr, ABI, testSigner);
      // const isBlacklisted2 = await contractFrom.isBlacklisted(addr);
      // console.log('CFrom is blacklisted', isBlacklisted2);

      try {
        tx = await contractFrom.transfer(owner, ethers.parseEther("1"));
        await tx.wait();
        console.log("  Error! Transaction from blacklisted address did not revert!");
      }
      catch(e) {
          console.log("  OK! Transaction from blacklisted address reverted!"); // reverted 交易被還原了（失敗了）
      }
    };

    console.log("TASK D");
    await taskDcbFrom(testAddr);

    // TASK E.
    //////////

    async function taskE() {
      let fromBlock = 0;
      let toBlock = await provider.getBlockNumber();

      // 用 Interface 來解析事件
      const iface = new ethers.Interface(ABI);

      // 查詢所有事件
      const logs = await contract.queryFilter("*", fromBlock, toBlock);

      let eventCounterBl = 0;
      let eventCounterUbl = 0;

      // 格式化地址為 checksum 格式（大小寫正確）
      const testAddrChecksum = ethers.getAddress(testAddr);

      for (const log of logs) {
        try {
          const parsed = iface.parseLog(log);
          const emittedAddr = ethers.getAddress(parsed.args[0]);

          if (parsed.name === "Blacklisted" && emittedAddr === testAddrChecksum) {
            eventCounterBl++;
          } else if (parsed.name === "Unblacklisted" && emittedAddr === testAddrChecksum) {
            eventCounterUbl++;
          }
        } catch (e) {
          // 某些 log 不屬於這個 ABI，跳過
        }
      }

      console.log("All parsed events for testAddr:");
      console.log("Blacklisted:", eventCounterBl, "Unblacklisted:", eventCounterUbl);

      if (eventCounterBl > 0 && eventCounterUbl > 0) {
        console.log("  OK! Events correctly emitted!");
      } else {
        console.log("  Error! Events NOT correctly emitted!");
      }
    }

    console.log("TASK E");
    await taskE(); 
  }


// 這段是「執行 main() 並處理錯誤」的固定寫法
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
