// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor() ERC20("TokenMock", "TM") {
        _mint(msg.sender, 1e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    } 
}