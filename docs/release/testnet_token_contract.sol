// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.28;

// import {ERC20} from "@openzeppelin/contracts@5.1.0/token/ERC20/ERC20.sol";
// import {ERC20Permit} from "@openzeppelin/contracts@5.1.0/token/ERC20/extensions/ERC20Permit.sol";

// contract AmbientUSDC is ERC20, ERC20Permit {
//     constructor() ERC20("Ambient USDC", "USDC") ERC20Permit("Ambient USDC") {
//         uint256 randomAmount = _generateRandomMintAmount();
//         _mint(msg.sender, randomAmount * 10 ** decimals());
//     }

//     // Override the decimals function
//     function decimals() public pure override returns (uint8) {
//         return 6; // Custom decimals
//     }

//     // Generate a pseudo-random mint amount
//     function _generateRandomMintAmount() private view returns (uint256) {
//         // Combine block timestamp, block difficulty, and sender address for randomness
//         uint256 seed = uint256(
//             keccak256(
//                 abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
//             )
//         );

//         // Map the random seed to a range, e.g., 1 billion to 10 billion
//         uint256 randomAmount = (seed % 9000000000) + 1000000000; // Range: 1,000,000,000 to 10,000,000,000
//         return randomAmount;
//     }
// }
