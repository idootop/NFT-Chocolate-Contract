import { kZeroAddress } from "../../utils/config";
import { ethers } from "hardhat";

// eslint-disable-next-line no-unused-vars
async function mintLand(p: {
  land: string;
  to: string;
  desp: string;
  url: string;
}) {
  const land = await ethers.getContractAt("DecentralizedLand", p.land);
  console.log(`Decentralized land #${p.desp} start mint...`);
  const tx = await land.mint(p.to, p.desp, p.url);
  console.log(`Decentralized land #${p.desp} request mint...`);
  await tx.wait();
  console.log(`Decentralized land #${p.desp} minted`);
}

async function main() {
  const world = await ethers.getContractAt(
    "DecentralizedWorld",
    "0xe98d9f7b48A5c6d31FBe8A5f343CD3E96357F6eA" //! todo 替换为链上真实的地址
  );
  console.log("Decentralized world #0 start mint...");
  const tx = await world.mint(
    kZeroAddress,
    "李知恩", // 描述
    "ipfs://QmSsTEFvBmjJjThSJcvfyqfLzXTYtTrMCsJCsqWawmckr5" // 图片地址
  );
  console.log("Decentralized world #0 request mint...");
  await tx.wait();
  console.log("Decentralized world #0 minted");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
