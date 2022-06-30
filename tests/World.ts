import { DecentralizedWorld } from "../types/DecentralizedWorld";
import { DecentralizedLand } from "../types/DecentralizedLand";
import { kZeroAddress } from "../utils/config";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let World: any, world: DecentralizedWorld, admin: any;

beforeEach(async function () {
  if (inited) return;
  [admin] = await ethers.getSigners();
  World = await ethers.getContractFactory("DecentralizedWorld");
  world = (await World.deploy()) as DecentralizedWorld;
  world = world.connect(admin);
  await world.deployed();
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
  it("Mint 1 land of world#0", async function () {
    world = world.connect(admin);
    const metadata = decode(await world.tokenURI(0));
    const landAddress = JSON.parse(metadata).land;
    const Land: any = await ethers.getContractFactory("DecentralizedLand");
    let land = Land.attach(landAddress) as DecentralizedLand;
    land = land.connect(admin);
    expect(await land.totalSupply()).to.equal(0);
    const tx = await land.mint(
      kZeroAddress,
      "李知恩",
      "ipfs://QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
    await tx.wait();
    expect(await land.totalSupply()).to.equal(1);
    expect(decode(await land.tokenURI(0))).to.include(
      "QmXVd7tMEa3oNQsrRncTDQe1V9JftAmuHqtFxUeqH7rukc"
    );
  });
});
