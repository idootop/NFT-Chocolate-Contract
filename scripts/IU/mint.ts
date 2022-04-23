import { kZeroAddress } from "../../utils/config";
import { ethers } from "hardhat";

async function main() {
  const iu = await ethers.getContractAt(
    "IUChocolate",
    "0xe98d9f7b48A5c6d31FBe8A5f343CD3E96357F6eA"
  );
  console.log("IU chocolate #0 start mint...");
  const tx = await iu.mint(
    kZeroAddress,
    "李知恩", // 描述
    "ipfs://QmSsTEFvBmjJjThSJcvfyqfLzXTYtTrMCsJCsqWawmckr5" // 图片地址
  );
  console.log("IU chocolate #0 request mint...");
  await tx.wait();
  console.log("IU chocolate #0 minted");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
