// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract IUChocolate is ERC721, ERC721Enumerable, ERC721URIStorage {
    address private owner;

    constructor() ERC721("IU Chocolate", "IU") {
        owner = msg.sender;
    }

    using Counters for Counters.Counter;
    Counters.Counter private tokens;

    function mint(string memory desp, string memory image) public {
        address to = msg.sender;
        uint256 tokenId = tokens.current();
        require(tokenId < 1000, "Total supply of IU chocolate is 1000.");
        string memory uri = generateTokenURI(tokenId, desp, image);
        tokens.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function update(
        uint256 tokenId,
        string memory desp,
        string memory image
    ) public {
        address from = msg.sender;
        require(
            from == owner || from == ownerOf(tokenId),
            string(
                abi.encodePacked(
                    "You're not the owner of ",
                    Strings.toString(tokenId)
                )
            )
        );
        string memory uri = generateTokenURI(tokenId, desp, image);
        _setTokenURI(tokenId, uri);
    }

    function generateTokenURI(
        uint256 tokenId,
        string memory desp,
        string memory image
    ) internal pure returns (string memory) {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{ "name": "IU chocolate #',
                        Strings.toString(tokenId),
                        '", "description": "',
                        desp,
                        '", ',
                        '"image": "',
                        image,
                        '" }'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
