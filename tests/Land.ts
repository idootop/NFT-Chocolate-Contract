import { DecentralizedLand } from "../types/DecentralizedLand";
import { kZeroAddress } from "../utils/config";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let Land: any, land: DecentralizedLand, admin: any, user1: any, user2: any;

beforeEach(async function () {
  if (inited) return;
  [admin, user1, user2] = await ethers.getSigners();
  Land = await ethers.getContractFactory("DecentralizedLand");
  land = (await Land.deploy(666)) as DecentralizedLand;
  land = land.connect(admin);
  await land.deployed();
  land = land.connect(user1);
  inited = true;
});

function decode(jsonStr: string) {
  const json = jsonStr.replace("data:application/json;base64,", "");
  return toUtf8String(base64.decode(json));
}

describe("Decentralized Land", function () {
  it("Mint one Land", async function () {
    land = land.connect(admin);
    const tx = await land.mint(
      kZeroAddress,
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(await land.totalSupply()).to.equal(1);
  });
  it("Owne one Land", async function () {
    land = land.connect(admin);
    expect(await land.ownerOf(0)).to.equal(admin.address);
  });
  it("Land #0's desp is correct", async function () {
    land = land.connect(admin);
    expect(decode(await land.tokenURI(0))).to.include("李知恩");
  });
  it("Land #0's image is correct", async function () {
    land = land.connect(admin);
    const metadata = decode(await land.tokenURI(0));
    expect(metadata).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Mint one Land by admin", async function () {
    land = land.connect(admin);
    const tx = await land.mint(
      user1.address,
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(await land.ownerOf(1)).to.equal(user1.address);
    expect(decode(await land.tokenURI(1))).to.include("李知恩");
    expect(decode(await land.tokenURI(1))).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Update one Land", async function () {
    land = land.connect(user1);
    const tx = await land.update(
      1,
      "Land forever",
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(decode(await land.tokenURI(1))).to.include("Land forever");
    expect(decode(await land.tokenURI(1))).to.include(
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Can't update other's Land", async function () {
    land = land.connect(user2);
    try {
      const tx = await land.update(
        0,
        "Land user2",
        "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc?user2=true"
      );
      await tx?.wait();
    } catch {}
    expect(decode(await land.tokenURI(0))).not.include("user2");
    expect(decode(await land.tokenURI(0))).not.include("user2");
  });
});
