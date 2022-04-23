import { runShell } from "./shell";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const api = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
  const height = 11095000;
  await runShell(`hardhat node --fork ${api} --fork-block-number ${height}`, {
    tag: "hardhat",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
