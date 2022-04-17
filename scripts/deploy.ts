import { ethers } from "hardhat";

async function main() {
  // We get the contract to deploy
  const IU = await ethers.getContractFactory("IUChocolate");
  const iu = await IU.deploy();

  await iu.deployed();

  console.log("IU chocolate deployed to:", iu.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
