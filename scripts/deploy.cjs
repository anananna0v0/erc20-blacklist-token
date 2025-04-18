const hre = require("hardhat");

async function main() {
  // 取得 Hardhat 提供的測試帳號
  const [deployer, validatorAccount] = await hre.ethers.getSigners();

  console.log("Deployer address:", deployer.address);
  console.log("Validator address (as account):", validatorAccount.address);

  // 1. 先部署 Validator 合約（用來記錄驗證資訊）
  const EmptyValidator = await hre.ethers.getContractFactory("EmptyValidator");
  const validatorContract = await EmptyValidator.deploy();
  await validatorContract.waitForDeployment();

  console.log("EmptyValidator deployed to:", validatorContract.target);

  // 2. 再部署 CensorableToken，傳入 validator 合約地址 + validator 帳號地址
  const CensorableToken = await hre.ethers.getContractFactory("CensorableToken");
  const token = await CensorableToken.deploy(
    validatorContract.target,
    validatorAccount.address
  );
  await token.waitForDeployment();

  console.log("CensorableToken deployed to:", token.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
