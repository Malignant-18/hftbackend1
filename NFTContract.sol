// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTContract is ERC721 {
    error BasicNft__TokenUriNotFound();

    event NFTCreated (
        address indexed buyer,
        string lotteryId,
        string tokenUri,
        uint256 tokenId
    );

    // Mapping from tokenId to tokenUri
    mapping(uint256 => string) private s_tokenIdToUri;
    // Mapping from tokenId to lotteryId
    mapping(uint256 => string) private s_tokenIdtoLotteryId;
    // Mapping from buyer address to list of token IDs
    mapping(address => uint256[]) private s_buyerToTokenIds;

    uint256 private s_tokenCounter;

    constructor() ERC721("Lottery", "LOT") {
        s_tokenCounter = 0;
    }

    function mintNft(address buyer, string memory tokenUri, string memory lotteryId) public {
        require(buyer != address(0), "Invalid Buyer Address");
        require(bytes(tokenUri).length > 0, "Invalid Token URI");
        require(bytes(lotteryId).length > 0, "Invalid Lottery ID");

        uint256 tokenId = s_tokenCounter;
        s_tokenIdToUri[tokenId] = tokenUri;
        s_tokenIdtoLotteryId[tokenId] = lotteryId;
        _safeMint(buyer, tokenId);
        s_buyerToTokenIds[buyer].push(tokenId);
        s_tokenCounter += 1;

        emit NFTCreated(buyer, lotteryId, tokenUri, tokenId);
    }

    function gettokenURI(uint256 tokenId) public view returns (string memory) {
        if (ownerOf(tokenId) == address(0)) {
            revert BasicNft__TokenUriNotFound();
        }
        return s_tokenIdToUri[tokenId];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLotteryId(uint256 tokenId) public view returns (string memory) {
        return s_tokenIdtoLotteryId[tokenId];
    }

    function getTokenIdsByBuyer(address buyer) public view returns (uint256[] memory) {
        return s_buyerToTokenIds[buyer];
    }
/*
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        address owner = ownerOf(tokenId);

        // Remove token ID from buyer's list
        uint256[] storage tokenIds = s_buyerToTokenIds[owner];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }

        delete s_tokenIdToUri[tokenId];
        delete s_tokenIdtoLotteryId[tokenId];

        _burn(tokenId);
    }*/
}
