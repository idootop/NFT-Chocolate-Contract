import { RICH as IRICH } from "../types/RICH";
import { kZeroAddress, kOneETH } from "../utils/config";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let RICH: any, rich: IRICH, admin: any, user1: any, tx: any;

beforeEach(async function () {
  if (inited) return;
  [admin, user1] = await ethers.getSigners();
  RICH = await ethers.getContractFactory("RICH");
  rich = (await RICH.deploy()) as IRICH;
  rich = rich.connect(admin);
  await rich.deployed();
  rich = rich.connect(user1);
  inited = true;
});

function decode(jsonStr: string) {
  const json = jsonStr.replace("data:application/json;base64,", "");
  return toUtf8String(base64.decode(json));
}

describe("Pretend I'M RICH", function () {
  it("Mint one RICH", async function () {
    rich = rich.connect(admin);
    tx = await rich.mint(
      kZeroAddress,
      "RICH #0",
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    try {
      rich = rich.connect(user1);
      tx = await rich.mint(
        user1.address,
        "RICH #0",
        "李知恩",
        "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc",
        { value: (kOneETH - 1n).toString() }
      );
      await tx.wait();
    } catch {}
    rich = rich.connect(user1);
    tx = await rich.mint(
      user1.address,
      "RICH #0",
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc",
      { value: kOneETH.toString() }
    );
    await tx.wait();

    expect(await rich.totalSupply()).to.equal(2);
  });
  it("Owne one RICH", async function () {
    rich = rich.connect(admin);
    expect(await rich.ownerOf(0)).to.equal(admin.address);
  });
  it("RICH #0's desp is correct", async function () {
    rich = rich.connect(admin);
    expect(decode(await rich.tokenURI(0))).to.include("李知恩");
  });
  it("RICH #0's image is correct", async function () {
    rich = rich.connect(admin);
    expect(decode(await rich.tokenURI(0))).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Update one RICH", async function () {
    rich = rich.connect(admin);
    const tx = await rich.update(
      0,
      "RICH #1",
      "RICH forever",
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(decode(await rich.tokenURI(0))).to.include("RICH forever");
    expect(decode(await rich.tokenURI(0))).to.include(
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Can't update other's RICH", async function () {
    rich = rich.connect(user1);
    try {
      const tx = await rich.update(
        0,
        "RICH #1",
        "RICH user1",
        "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc?user1"
      );
      await tx.wait();
    } catch {}
    expect(decode(await rich.tokenURI(0))).not.include("user1");
    expect(decode(await rich.tokenURI(0))).not.include("user1");
  });
});
