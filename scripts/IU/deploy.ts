import { ethers } from "hardhat";

async function main() {
  const IU = await ethers.getContractFactory("IUChocolate");
  console.log("IU chocolate start deploy...");
  const iu = await IU.deploy();
  console.log("IU chocolate request deploy...");
  await iu.deployed();
  console.log("IU chocolate deployed to:", iu.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
