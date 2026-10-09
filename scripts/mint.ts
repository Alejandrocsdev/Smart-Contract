// Mints Test USDT on BSC Testnet, signed by the token's owner (OWNER_KEYSTORE).
//
//   npm run mint -- <address> <amount>      e.g.  npm run mint -- 0xC71B…B491 100
//
// <amount> is in USDT (decimals allowed, e.g. 2.5).
import { Contract, formatUnits, getAddress, isAddress, parseUnits } from "ethers";
import { artifact, connectOwner, deployment, EXPLORER_URL } from "./owner.ts";

const [to, amountText] = process.argv.slice(2);
if (!to || !isAddress(to) || !amountText || !/^\d+(\.\d{1,18})?$/.test(amountText) || Number(amountText) <= 0) {
  console.error("Usage: npm run mint -- <address> <amount in USDT>   e.g. npm run mint -- 0xC71B…B491 100");
  process.exit(1);
}

const { address } = deployment();
const { owner } = await connectOwner();
const token = new Contract(address, artifact().abi, owner);

const amount = parseUnits(amountText, 18);
const tx = await token.mint(getAddress(to), amount);
console.log(`Minting ${amountText} USDT to ${getAddress(to)} — ${tx.hash}`);
await tx.wait();
console.log(`Done. Balance of ${getAddress(to)}: ${formatUnits(await token.balanceOf(to), 18)} USDT`);
console.log(`${EXPLORER_URL}/tx/${tx.hash}`);
