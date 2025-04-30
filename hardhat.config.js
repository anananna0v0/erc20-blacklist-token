import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.20",
  defaultNetwork: "unima",
  networks: {
    unima: {
      url: "http://134.155.52.185:32779",
      chainId: 585858,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
