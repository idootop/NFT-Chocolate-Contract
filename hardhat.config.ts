import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// 正式环境
const isProd = process.env.PROD !== undefined;

// PRIVATE_KEY
const privateKey: string | undefined = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

// HD 钱包助记词
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

// alchemy api key
const alchemy: string | undefined = process.env.ALCHEMY_API_KEY;
if (!alchemy) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
}

const chainIds = {
  // Ethereum 主网
  mainnet: 1,
  // 测试网
  ropsten: 3,
  rinkeby: 4,
};

const hdAccounts = {
  count: 1,
  mnemonic,
  path: "m/44'/60'/0'/0",
};

const getChainConfig = (chain: keyof typeof chainIds) => {
  return {
    chainId: chainIds[chain],
    url: `https://eth-${chain}.alchemyapi.io/v2/${alchemy}`,
    accounts: chain === "mainnet" ? [privateKey] : hdAccounts,
  };
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: hdAccounts,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemy}`,
        blockNumber: 11095000,
      },
    },
    mainnet: getChainConfig("mainnet"),
    ropsten: getChainConfig("ropsten"),
    rinkeby: getChainConfig("rinkeby"),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: isProd,
        runs: 800,
      },
    },
  },
};

export default config;
