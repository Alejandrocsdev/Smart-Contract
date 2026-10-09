import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

const usdt = (amount: string) => ethers.parseUnits(amount, 18);

const deploy = async () => {
  const [owner, user, other] = await ethers.getSigners();
  const token = await ethers.deployContract("TestUSDT", [owner.address]);
  return { token, owner, user, other };
};

describe("TestUSDT", () => {
  it("looks like BSC-USD: name, symbol, 18 decimals, no supply yet", async () => {
    const { token, owner } = await deploy();
    expect(await token.name()).to.equal("Tether USD (Test)");
    expect(await token.symbol()).to.equal("USDT");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.owner()).to.equal(owner.address);
  });

  it("lets the owner mint to any address", async () => {
    const { token, user } = await deploy();
    await token.mint(user.address, usdt("1000"));
    expect(await token.balanceOf(user.address)).to.equal(usdt("1000"));
    expect(await token.totalSupply()).to.equal(usdt("1000"));
  });

  it("emits Transfer from the zero address on mint (seen as a deposit)", async () => {
    const { token, user } = await deploy();
    await expect(token.mint(user.address, usdt("2.5")))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, user.address, usdt("2.5"));
  });

  it("refuses mint from anyone but the owner", async () => {
    const { token, user, other } = await deploy();
    await expect(token.connect(user).mint(other.address, usdt("1")))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(user.address);
  });

  it("transfers like a normal ERC-20 and emits Transfer", async () => {
    const { token, user, other } = await deploy();
    await token.mint(user.address, usdt("10"));
    await expect(token.connect(user).transfer(other.address, usdt("3")))
      .to.emit(token, "Transfer")
      .withArgs(user.address, other.address, usdt("3"));
    expect(await token.balanceOf(user.address)).to.equal(usdt("7"));
    expect(await token.balanceOf(other.address)).to.equal(usdt("3"));
  });

  it("refuses a transfer above the balance", async () => {
    const { token, user, other } = await deploy();
    await token.mint(user.address, usdt("1"));
    await expect(token.connect(user).transfer(other.address, usdt("1.000000000000000001")))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("lets the owner hand minting over to another address", async () => {
    const { token, owner, user, other } = await deploy();
    await token.transferOwnership(user.address);
    await expect(token.connect(owner).mint(other.address, usdt("1"))).to.be.revertedWithCustomError(
      token,
      "OwnableUnauthorizedAccount",
    );
    await token.connect(user).mint(other.address, usdt("1"));
    expect(await token.balanceOf(other.address)).to.equal(usdt("1"));
  });
});
