import { ethers } from "hardhat";

async function main() {
  const world = await ethers.getContractAt(
    "DecentralizedWorld",
    "0xC484C5002f18e7C33ac45ca07087E7aEcC9c6cD9" //! todo 替换为链上真实的地址
  );
  console.log("new owner start set...");
  const tx = await world.setOwner("0x5763c5975783E2cf97abF7Da09D2d92D9558D377");
  console.log("new owner request set...");
  await tx.wait();
  console.log("new owner updated!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
