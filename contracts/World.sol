// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./Land.sol";

struct WorldMetadata {
    string desp;
    string image;
    address land;
}

abstract contract WorldMetadataStorage is ERC721 {
    using Strings for uint256;

    mapping(uint256 => WorldMetadata) private _tokenMetadatas;

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "WorldMetadataStorage: URI query for nonexistent token"
        );

        WorldMetadata memory metadata = _tokenMetadatas[tokenId];
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{ "name": "DecentralizedWorld #',
                        Strings.toString(tokenId),
                        '", "description": "',
                        metadata.desp,
                        '", "image": "',
                        metadata.image,
                        '", "land": "',
                        Strings.toHexString(uint160(metadata.land), 20),
                        '" }'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _setTokenMetadata(uint256 tokenId, WorldMetadata memory metadata)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "WorldMetadataStorage: Metadata set of nonexistent token"
        );
        WorldMetadata memory oldMetadata = _tokenMetadatas[tokenId];
        if (oldMetadata.land == address(0)) {
            metadata.land = address(new DecentralizedLand(msg.sender, tokenId));
        } else {
            metadata.land = oldMetadata.land;
        }
        _tokenMetadatas[tokenId] = metadata;
    }

    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);
        delete _tokenMetadatas[tokenId];
    }
}

contract DecentralizedWorld is ERC721, ERC721Enumerable, WorldMetadataStorage {
    address private owner;

    constructor() ERC721("Decentralized World", "WORLD") {
        owner = msg.sender;
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
        _setTokenMetadata(tokenId, WorldMetadata(desp, image, address(0)));
        emit MintSuccess(tokenId);
    }

    function update(
        uint256 tokenId,
        string memory desp,
        string memory image
    ) public {
        address sender = msg.sender;
        if (sender != ownerOf(tokenId)) revert NotTheOwner();
        _setTokenMetadata(tokenId, WorldMetadata(desp, image, address(0)));
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
        override(ERC721, WorldMetadataStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, WorldMetadataStorage)
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
