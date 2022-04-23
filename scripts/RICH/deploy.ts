import { ethers } from "hardhat";

async function main() {
  const RICH = await ethers.getContractFactory("RICH");
  console.log("RICH start deploy...");
  const rich = await RICH.deploy();
  console.log("RICH request deploy...");
  await rich.deployed();
  console.log("RICH deployed to:", rich.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
