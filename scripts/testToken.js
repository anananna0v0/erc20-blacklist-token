import pkg from "hardhat";
const { ethers } = pkg;
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const contractJson = require("../artifacts/contracts/CensorableToken.sol/CensorableToken.json");

async function main() {
    const [signer1, signer2] = await ethers.getSigners();
    if (!signer1 || !signer2) {
        console.error("❌ Unable to get signers");
        process.exit(1);
    }

    console.log("Signer1 address:", signer1.address);
    const contractAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // ✅ 請確認為最新部署地址
    const ABI = contractJson.abi;

    let contract;
    try {
        contract = new ethers.Contract(contractAddr, ABI, signer1);
        console.log("✅ Contract created at:", contract.target || contract.address);
    } catch (err) {
        console.error("❌ Failed to create contract:", err);
        process.exit(1);
    }

    const owner = signer1.address;
    const testSigner = signer2;
    const testAddr = testSigner.address;
    const validatorAddr = "0x8452E41BA34aC00458B70539264776b2a379448f";

    // ✅ TASK A1
    async function taskA1() {
        console.log("\nTASK A1");
        const balVal = await contract.balanceOf(validatorAddr);
        const balOwner = await contract.balanceOf(owner);

        console.log("Validator balance:", ethers.formatEther(balVal));
        console.log("Owner balance:", ethers.formatEther(balOwner));

        const expectedBalVal = ethers.parseEther("10");

        if (balVal.toString() !== expectedBalVal.toString()) {
            console.error("❌ Validator balance not 10 tokens");
        } else {
            console.log("✅ Validator balance is 10 tokens");
        }

        const totalSupply = await contract.totalSupply();
        const expectedOwnerBal = totalSupply - expectedBalVal;

        if (balOwner.toString() !== expectedOwnerBal.toString()) {
            console.error("❌ Owner balance is not totalSupply - 10");
        } else {
            console.log("✅ Owner balance is correct");
        }
    }

    // ✅ TASK A2
    async function taskA2() {
        console.log("\nTASK A2");
        const allowance = await contract.allowance(owner, validatorAddr);
        const totalSupply = await contract.totalSupply();
        const expectedAll = totalSupply - ethers.parseEther("10");

        console.log("Validator allowance:", ethers.formatEther(allowance));

        if (allowance.toString() !== expectedAll.toString()) {
            console.error("❌ Allowance incorrect");
        } else {
            console.log("✅ Allowance correct");
        }
    }

    // ✅ TASK B + C
    async function taskBandC(addr, cb) {
        console.log("\nTASK B/C");

        let isBl = await contract.isBlacklisted(addr);

        if (isBl) {
            console.log("🔄 Address is blacklisted, unblacklisting...");
            await (await contract.unblacklistAddress(addr)).wait();
        } else {
            console.log("🔒 Address not blacklisted, blacklisting...");
            await (await contract.blacklistAddress(addr)).wait();
        }

        const result = await contract.isBlacklisted(addr);
        console.log(result ? "✅ Now blacklisted" : "✅ Now unblacklisted");

        if (cb) await cb(addr, result);
    }

    // ✅ TASK D (to)
    async function taskDcb(addr, isBlacklisted) {
        console.log("\nTASK D (to)");

        try {
            await (await contract.transfer(addr, ethers.parseEther("1"))).wait();
            if (isBlacklisted) {
                console.error("❌ Transfer to blacklisted address succeeded");
            } else {
                console.log("✅ Transfer to non-blacklisted address succeeded");
            }
        } catch (e) {
            if (isBlacklisted) {
                console.log("✅ Transfer to blacklisted address reverted");
            } else {
                console.error("❌ Transfer to non-blacklisted address failed unexpectedly");
            }
        }
    }

    // ✅ TASK D (from)
    async function taskDcbFrom(addr) {
        console.log("\nTASK D (from)");

        const isBlacklisted = await contract.isBlacklisted(addr);
        if (!isBlacklisted) {
            await (await contract.transfer(addr, ethers.parseEther("1"))).wait();
            await (await contract.blacklistAddress(addr)).wait();
        }

        const contractFrom = new ethers.Contract(contractAddr, ABI, testSigner);
        try {
            await (await contractFrom.transfer(owner, ethers.parseEther("1"))).wait();
            console.error("❌ Transfer from blacklisted address succeeded");
        } catch (e) {
            console.log("✅ Transfer from blacklisted address reverted");
        }
    }

    // ✅ TASK E - check events
    async function taskE() {
        console.log("\nTASK E");

        const fromBlock = 0;
        const toBlock = await ethers.provider.getBlockNumber();
        const events = await contract.queryFilter("*", fromBlock, toBlock);

        let eventCounterBl = 0;
        let eventCounterUbl = 0;

        for (const log of events) {
            try {
                const parsed = contract.interface.parseLog(log);
                if (parsed.name === "Blacklisted" && parsed.args[0] === testAddr) eventCounterBl++;
                if (parsed.name === "UnBlacklisted" && parsed.args[0] === testAddr) eventCounterUbl++;
            } catch (_) {}
        }

        if (eventCounterBl > 0 && eventCounterUbl > 0) {
            console.log("✅ Events Blacklisted/UnBlacklisted emitted correctly");
        } else {
            console.error("❌ Events not emitted as expected");
        }
    }

    // ✅ Run all
    await taskA1();
    await taskA2();
    await taskBandC(testAddr);
    await taskBandC(testAddr, taskDcb);
    await taskDcbFrom(testAddr);
    await taskE();
}

main().catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
});
