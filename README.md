# Test USDT for BSC Testnet

A mintable stand-in for **USDT on BNB Smart Chain (BSC-USD)**, for testing apps that accept or send USDT. It has no value and only runs on **BSC Testnet** (chain 97).

- **ERC-20 / BEP-20**: OpenZeppelin 5, name "Tether USD (Test)", symbol `USDT`.
- **18 decimals**, like BSC-USD on mainnet, so code written for one handles the other the same way.
- **Only the owner can mint**, any amount, to any address. Ownership can be transferred.

## Deployed

| Network | Address | Owner |
|---|---|---|
| BSC Testnet | [`0x1f944D1886A2ffb804578891FD1C6579868aa2d3`](https://testnet.bscscan.com/address/0x1f944D1886A2ffb804578891FD1C6579868aa2d3) | `0xA0ff45a1a5250b9E6f93F7406Fe2b4A6fb878Ce0` |

Details are in [`deployments/bscTestnet.json`](deployments/bscTestnet.json); the mint script reads the address from there. To see the token in MetaMask, import it as a custom token with that address.

## Setup

Requires Node.js 22 or newer.

```bash
npm install
cp .env.sample .env      # then fill it in
```

| Variable | |
|---|---|
| `RPC_URL` | A BSC Testnet RPC endpoint, e.g. `https://bsc-testnet.nodereal.io/v1/<key>` |
| `OWNER_KEYSTORE` | The owner's encrypted JSON keystore (absolute, `~/` or relative path) |
| `OWNER_KEYSTORE_PASSWORD_FILE` | A text file containing that keystore's password |

The private key is never stored in this project. It's decrypted from the keystore only while a script runs. The owner needs some tBNB for gas, from the [BNB Chain faucet](https://www.bnbchain.org/en/testnet-faucet).

## Use

```bash
npm test                                   # contract tests on Hardhat's local chain
npm run mint -- <address> <amount>         # e.g. npm run mint -- 0xC71B1c9d00628f1C24B05aEC8aadcD70BDD8B491 100
npm run deploy                             # deploy a new token (owner = OWNER_KEYSTORE's address)
```

- **mint**: `<amount>` is in USDT; decimals are allowed (`2.5`). Only the owner's keystore can mint.
- **deploy**: refuses while `deployments/bscTestnet.json` exists, so a second token is never created by accident. To really deploy a new one, delete or rename that file first, then update the apps that use the old address.

## Layout

```
contracts/TestUSDT.sol        the token
test/TestUSDT.ts              tests (npm test)
scripts/deploy.ts             deploy to BSC Testnet, write deployments/bscTestnet.json
scripts/mint.ts               mint to any address
scripts/owner.ts              shared: RPC connection, owner keystore, deployment file
deployments/bscTestnet.json   the deployed address (committed)
```
