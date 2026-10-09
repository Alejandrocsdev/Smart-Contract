// Deploys TestUSDT to BSC Testnet, owned by the wallet in OWNER_KEYSTORE (the
// only address that can mint), and records it in deployments/bscTestnet.json.
//
//   npm run deploy
//
// Refuses if a deployment is already recorded, so a second token is never
// created by accident (delete the file first to really deploy a new one).
import fs from "node:fs";
import path from "node:path";
import { ContractFactory, formatEther } from "ethers";
import { artifact, connectOwner, DEPLOYMENT_FILE, EXPLORER_URL } from "./owner.ts";

if (fs.existsSync(DEPLOYMENT_FILE)) {
  const { address } = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
  console.error(`Already deployed at ${address} (${path.relative(process.cwd(), DEPLOYMENT_FILE)}). Nothing done.`);
  process.exit(1);
}

const { provider, owner } = await connectOwner();
console.log(`Deploying TestUSDT from ${owner.address} (the owner)`);
console.log(`Owner balance: ${formatEther(await provider.getBalance(owner.address))} tBNB`);

const { abi, bytecode } = artifact();
const contract = await new ContractFactory(abi, bytecode, owner).deploy(owner.address);
const tx = contract.deploymentTransaction()!;
console.log(`Transaction ${tx.hash} — waiting for confirmation…`);
const receipt = (await tx.wait())!;
const address = await contract.getAddress();

fs.mkdirSync(path.dirname(DEPLOYMENT_FILE), { recursive: true });
fs.writeFileSync(
  DEPLOYMENT_FILE,
  `${JSON.stringify(
    {
      network: "bscTestnet",
      chainId: 97,
      contract: "TestUSDT",
      address,
      owner: owner.address,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      deployedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);

console.log(`TestUSDT deployed at ${address} (block ${receipt.blockNumber})`);
console.log(`Gas paid: ${formatEther(receipt.gasUsed * receipt.gasPrice)} tBNB`);
console.log(`${EXPLORER_URL}/address/${address}`);
