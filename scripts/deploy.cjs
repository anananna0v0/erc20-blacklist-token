const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying CensorableToken with deployer account:", deployer.address);

    const name = "Censorable Token";
    const symbol = "CTK";
    const initialSupply = hre.ethers.parseEther("100");
    const validator = "0x8452E41BA34aC00458B70539264776b2a379448f";

    const CensorableToken = await hre.ethers.getContractFactory("CensorableToken");
    const token = await CensorableToken.deploy(name, symbol, initialSupply, deployer.address, validator);
    await token.waitForDeployment();

    const address = await token.getAddress();
    console.log("✅ CensorableToken deployed to:", address);

    const balance = await token.balanceOf(deployer.address);
    const approveTx = await token.approve(validator, balance);
    await approveTx.wait();

    console.log(`✅ Approved validator to spend ${hre.ethers.formatEther(balance)} tokens`);
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
