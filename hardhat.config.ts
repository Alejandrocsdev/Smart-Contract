import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

// TestUSDT: a mintable USDT stand-in for BSC Testnet. `npm test` runs on
// Hardhat's built-in local chain; deploying and minting (scripts/) talk to BSC
// Testnet directly through RPC_URL in .env.
export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
});
