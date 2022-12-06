// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './ERC721Enumerable.sol';

contract NFT is ERC721Enumerable {
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
    }
}
