pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HighwayToHellNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("HighwayToHellNFT", "H2H") {}

    function getBridgedNFT(string memory oldTokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(_msgSender(), newTokenId);
        _tokenURIs[newTokenId] = oldTokenURI;

        return newTokenId;
    }

    function tokenURI(uint256 tokenID) public view override returns (string memory)  {
        // require(_msgSender() == ERC721.ownerOf(tokenID));
        return _tokenURIs[tokenID];
    }
}
