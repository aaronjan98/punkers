// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './ERC721Enumerable.sol';
import './Ownable.sol';

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = '.json';
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;

    event Mint(uint256 amount, address minter);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }

    function mint(uint256 _mintAmount) public payable {
        require(
            block.timestamp >= allowMintingOn,
            'trying to mint before specified minting time'
        );
        require(msg.value >= cost * _mintAmount, 'not enough payment');
        require(_mintAmount > 0, 'Must mint at least 1 token');

        uint256 supply = totalSupply();

        require(
            supply + _mintAmount <= maxSupply,
            "can't mint more tokens than available"
        );

        // Create a tokens
        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        // Emit event
        emit Mint(_mintAmount, msg.sender);
    }

    // Return metadata IPFS url
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(_tokenId), 'token does not exist');
        return (
            string(
                abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)
            )
        );
    }

    function walletOfOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
}
