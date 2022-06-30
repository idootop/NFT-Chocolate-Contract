import { ethers } from "hardhat";

async function main() {
  const World = await ethers.getContractFactory("DecentralizedWorld");
  console.log("Decentralized world start deploy...");
  const world = await World.deploy();
  console.log("Decentralized world request deploy...");
  await world.deployed();
  console.log("Decentralized world deployed to:", world.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
