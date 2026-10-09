// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Test USDT for BSC Testnet
/// @notice A stand-in for BSC-USD (USDT on BNB Smart Chain) so apps can test
/// deposits and withdrawals with as much USDT as needed. Testnet only — it has
/// no value. Like BSC-USD on mainnet it uses 18 decimals, so code written for
/// one handles the other the same way.
/// @dev Only the owner can mint. Transfers, balances and the Transfer event are
/// plain OpenZeppelin ERC-20.
contract TestUSDT is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Tether USD (Test)", "USDT") Ownable(initialOwner) {}

    /// @notice Creates `amount` new tokens (in 18-decimal base units) for `to`.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
