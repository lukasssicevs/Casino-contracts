// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// Casino Token (1 CSN = 0.0001 ETH)
contract CasinoToken is ERC20, ERC20Burnable, Ownable {

    error CasinoToken__InsufficientTokens();

    constructor() ERC20("Casino Token", "CSN") payable {
        _mint(msg.sender, msg.value / 1e10 );
    }

    function decimals() public pure override returns (uint8) {
		return 4;
	}

    modifier appropriateBacking(uint256 amount, uint256 value) {
        require(value / amount == 1e10 , "Inappropriate amount of ether provided");
        _;
    }

    // For mint transaction to work add a value of amount * 1e10 Wei
    function mint(address to, uint256 amount) public payable appropriateBacking(amount, msg.value) {
        _mint(to, amount);
    }

    function burn(uint256 amount) public override {
        _burn(_msgSender(), amount);
        address payable sender = payable(_msgSender());
        uint256 weiToReturn = amount * 1e10;
        sender.transfer(weiToReturn);
    }
}