// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct NFTMetadata {
    string name;
    string desp;
    string image;
}

abstract contract ERC721MetadataStorage is ERC721 {
    using Strings for uint256;

    mapping(uint256 => NFTMetadata) private _tokenMetadatas;

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
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
                        '{ "name": ',
                        metadata.name,
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

contract RICH is ERC721, ERC721Enumerable, ERC721MetadataStorage {
    address private owner;
    uint256 public pendingWithdrawal;

    constructor() ERC721("Pretend I'M RICH", "RICH") {
        owner = msg.sender;
    }

    event WithdrawSuccess();
    event MintSuccess(uint256 tokenId);
    event UpdateSuccess();

    error InadequateBids(uint256 amount);
    error NotTheOwner();

    function withdraw() public {
        uint256 amount = pendingWithdrawal;
        pendingWithdrawal = 0;
        payable(owner).transfer(amount);
        emit WithdrawSuccess();
    }

    function mint(
        address to,
        string memory name,
        string memory desp,
        string memory image
    ) public payable {
        uint256 amount = msg.value;
        address target = to == address(0) ? msg.sender : to;
        if (msg.sender != owner && amount < 1 ether)
            revert InadequateBids(amount);
        uint256 tokenId = totalSupply();
        pendingWithdrawal += msg.value;
        _safeMint(target, tokenId);
        _setTokenMetadata(tokenId, NFTMetadata(name, desp, image));
        emit MintSuccess(tokenId);
    }

    function update(
        uint256 tokenId,
        string memory name,
        string memory desp,
        string memory image
    ) public {
        address sender = msg.sender;
        if (sender != ownerOf(tokenId)) revert NotTheOwner();
        _setTokenMetadata(tokenId, NFTMetadata(name, desp, image));
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
        override(ERC721, ERC721MetadataStorage)
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
