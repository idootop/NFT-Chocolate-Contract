import { IUChocolate } from "@/types/IUChocolate";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let IU: any, iu: IUChocolate, admin: any, user1: any, user2: any, tokenId: any;

beforeEach(async function () {
  if (inited) return;
  [admin, user1, user2] = await ethers.getSigners();
  IU = await ethers.getContractFactory("IUChocolate");
  iu = (await IU.deploy()) as IUChocolate;
  iu = iu.connect(admin);
  await iu.deployed();
  iu = iu.connect(user1);
  inited = true;
});

function decode(jsonStr: string) {
  const json = jsonStr.replace("data:application/json;base64,", "");
  return toUtf8String(base64.decode(json));
}

describe("IU Chocolate", function () {
  it("Mint one IU", async function () {
    const tx = await iu.mint(
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    tokenId = await iu.tokenByIndex(0);
    expect(await iu.totalSupply()).to.equal(1);
  });
  it("Owne one IU", async function () {
    expect(await iu.ownerOf(tokenId)).to.equal(user1.address);
  });
  it("IU#0's desp is correct", async function () {
    expect(decode(await iu.tokenURI(tokenId))).to.include("李知恩");
  });
  it("IU#0's image is correct", async function () {
    expect(decode(await iu.tokenURI(tokenId))).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Update one IU", async function () {
    const tx = await iu.update(
      tokenId,
      "IU forever",
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(decode(await iu.tokenURI(tokenId))).to.include("IU forever");
    expect(decode(await iu.tokenURI(tokenId))).to.include(
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Update one IU by admin", async function () {
    iu = iu.connect(admin);
    const tx = await iu.update(
      tokenId,
      "IU admin",
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc?admin=true"
    );
    await tx.wait();
    expect(decode(await iu.tokenURI(tokenId))).to.include("admin");
    expect(decode(await iu.tokenURI(tokenId))).to.include("admin");
  });
  it("Can't update other's IU", async function () {
    iu = iu.connect(user2);
    try {
      const tx = await iu.update(
        tokenId,
        "IU user2",
        "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc?user2=true"
      );
      await tx?.wait();
    } catch {}
    expect(decode(await iu.tokenURI(tokenId))).not.include("user2");
    expect(decode(await iu.tokenURI(tokenId))).not.include("user2");
  });
});
