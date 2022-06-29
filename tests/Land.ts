import { DecentralizedLand } from "../types/DecentralizedLand";
import { kZeroAddress } from "../utils/config";
import { expect } from "chai";
import { base64, toUtf8String } from "ethers/lib/utils";
import { ethers } from "hardhat";

let inited = false;
let Land: any, land: DecentralizedLand, admin: any;

beforeEach(async function () {
  if (inited) return;
  [admin] = await ethers.getSigners();
  Land = await ethers.getContractFactory("DecentralizedLand");
  land = (await Land.deploy(666)) as DecentralizedLand;
  land = land.connect(admin);
  await land.deployed();
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
});
