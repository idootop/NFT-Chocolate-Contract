// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct NFTMetadata {
    string desp;
    string image;
}

abstract contract ERC721MetadataStorage is ERC721 {
    using Strings for uint256;

    mapping(uint256 => NFTMetadata) private _tokenMetadatas;

    function landURI(uint256 landId, uint256 tokenId)
        public
        view
        virtual
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721MetadataStorage: URI query for nonexistent token"
        );

        NFTMetadata memory metadata = _tokenMetadatas[tokenId];
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{ "name": "Decentralized Land ',
                        Strings.toString(landId),
                        " #",
                        Strings.toString(tokenId),
                        '", "description": "',
                        metadata.desp,
                        '", "image": "',
                        metadata.image,
                        '" }'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _setTokenMetadata(uint256 tokenId, NFTMetadata memory metadata)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721MetadataStorage: Metadata set of nonexistent token"
        );
        _tokenMetadatas[tokenId] = metadata;
    }

    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);
        delete _tokenMetadatas[tokenId];
    }
}

contract DecentralizedLand is ERC721, ERC721Enumerable, ERC721MetadataStorage {
    address private owner;
    uint256 public landId;

    constructor(uint256 id) ERC721("Decentralized Land", "LAND") {
        owner = msg.sender;
        landId = id;
    }

    event MintSuccess(uint256 tokenId);
    event UpdateSuccess();

    error NotTheOwner();
    error OnlyOne();

    function mint(
        address to,
        string memory desp,
        string memory image
    ) public {
        require(msg.sender == owner, "Excuse me?");
        uint256 tokenId = totalSupply();
        address target = to == address(0) ? msg.sender : to;
        _safeMint(target, tokenId);
        _setTokenMetadata(tokenId, NFTMetadata(desp, image));
        emit MintSuccess(tokenId);
    }

    function update(
        uint256 tokenId,
        string memory desp,
        string memory image
    ) public {
        address sender = msg.sender;
        if (sender != ownerOf(tokenId)) revert NotTheOwner();
        _setTokenMetadata(tokenId, NFTMetadata(desp, image));
        emit UpdateSuccess();
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
        override(ERC721, ERC721MetadataStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        return super.landURI(landId, tokenId);
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
