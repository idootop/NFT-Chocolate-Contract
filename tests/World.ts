import { DecentralizedWorld } from "../types/DecentralizedWorld";
import { kZeroAddress } from "../utils/config";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let World: any, world: DecentralizedWorld, admin: any, user1: any, user2: any;

beforeEach(async function () {
  if (inited) return;
  [admin, user1, user2] = await ethers.getSigners();
  World = await ethers.getContractFactory("DecentralizedWorld");
  world = (await World.deploy()) as DecentralizedWorld;
  world = world.connect(admin);
  await world.deployed();
  world = world.connect(user1);
  inited = true;
});

function decode(jsonStr: string) {
  const json = jsonStr.replace("data:application/json;base64,", "");
  return toUtf8String(base64.decode(json));
}

describe("Decentralized World", function () {
  it("Mint one World", async function () {
    world = world.connect(admin);
    const tx = await world.mint(
      kZeroAddress,
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(await world.totalSupply()).to.equal(1);
  });
  it("Owne one World", async function () {
    world = world.connect(admin);
    expect(await world.ownerOf(0)).to.equal(admin.address);
  });
  it("World #0's desp is correct", async function () {
    world = world.connect(admin);
    expect(decode(await world.tokenURI(0))).to.include("李知恩");
  });
  it("World #0's image is correct", async function () {
    world = world.connect(admin);
    const metadata = decode(await world.tokenURI(0));
    expect(metadata).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Mint one World by admin", async function () {
    world = world.connect(admin);
    const tx = await world.mint(
      user1.address,
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(await world.ownerOf(1)).to.equal(user1.address);
    expect(decode(await world.tokenURI(1))).to.include("李知恩");
    expect(decode(await world.tokenURI(1))).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Update one World", async function () {
    world = world.connect(user1);
    const tx = await world.update(
      1,
      "World forever",
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(decode(await world.tokenURI(1))).to.include("World forever");
    expect(decode(await world.tokenURI(1))).to.include(
      "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
  it("Can't update other's World", async function () {
    world = world.connect(user2);
    try {
      const tx = await world.update(
        0,
        "World user2",
        "https://cloudflare-ipfs.com/ipfs/QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc?user2=true"
      );
      await tx?.wait();
    } catch {}
    expect(decode(await world.tokenURI(0))).not.include("user2");
    expect(decode(await world.tokenURI(0))).not.include("user2");
  });
});
