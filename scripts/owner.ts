// Shared by the deploy and mint scripts: BSC Testnet through RPC_URL, and the
// token owner's wallet as signer — decrypted from an encrypted JSON keystore
// (OWNER_KEYSTORE + OWNER_KEYSTORE_PASSWORD_FILE in .env). The private key is
// never stored in this project.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JsonRpcProvider, Wallet } from "ethers";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BSC_TESTNET_CHAIN_ID = 97n;

export const DEPLOYMENT_FILE = path.join(ROOT, "deployments", "bscTestnet.json");
export const EXPLORER_URL = "https://testnet.bscscan.com";

const ENV_FILE = path.join(ROOT, ".env");
if (!fs.existsSync(ENV_FILE)) {
  console.error("Missing .env — copy .env.sample to .env and fill it in.");
  process.exit(1);
}
process.loadEnvFile(ENV_FILE);

const env = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set in .env`);
  return value;
};

// "~/keys/x.json" -> "/home/you/keys/x.json"; relative paths are from this project.
const filePath = (name: string) => path.resolve(ROOT, env(name).replace(/^~(?=$|\/)/, os.homedir()));

export const connectOwner = async () => {
  const provider = new JsonRpcProvider(env("RPC_URL"));
  const { chainId } = await provider.getNetwork();
  // Test token only: never on mainnet.
  if (chainId !== BSC_TESTNET_CHAIN_ID) throw new Error(`RPC_URL is on chain ${chainId}; this tool only runs on BSC Testnet (97)`);

  const json = fs.readFileSync(filePath("OWNER_KEYSTORE"), "utf8");
  const password = fs.readFileSync(filePath("OWNER_KEYSTORE_PASSWORD_FILE"), "utf8").trim();
  const owner = (await Wallet.fromEncryptedJson(json, password)).connect(provider);
  return { provider, owner };
};

// The compiled contract (run `hardhat compile` first).
export const artifact = () =>
  JSON.parse(fs.readFileSync(path.join(ROOT, "artifacts", "contracts", "TestUSDT.sol", "TestUSDT.json"), "utf8")) as {
    abi: any[];
    bytecode: string;
  };

export const deployment = () => {
  if (!fs.existsSync(DEPLOYMENT_FILE)) throw new Error("Not deployed yet — run npm run deploy first");
  return JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8")) as { address: string; owner: string };
};
