// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    // Importing the Counters library for managing counters
    using Counters for Counters.Counter;

    // Creating two counters for tracking token IDs and items sold
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    // Setting the initial listing price for creating market items
    uint256 listingPrice = 0.000000001 ether;

    // Declaring a payable address variable for the contract owner
    address payable owner;

    // Mapping to store MarketItem struct by token ID
    mapping(uint256 => MarketItem) private idToMarketItem;

    // Defining the MarketItem struct
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // Event triggered when a new market item is created
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // Constructor initializing the ERC721 token with name "Metaverse Tokens" and symbol "METT"
    constructor() ERC721("Metaverse Tokens", "METT") {
        // Setting the contract owner as the deployer of the contract
        owner = payable(msg.sender);
    }

    // Function to update the listing price, can only be called by the contract owner
    function updateListingPrice(uint256 _listingPrice) public payable {
        require(
            owner == msg.sender,
            "Only marketplace owner can update listing price."
        );
        // Updating the listing price
        listingPrice = _listingPrice;
    }

    // Function to get the current listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Function to create a new token and corresponding market item
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        // Incrementing the token ID counter
        _tokenIds.increment();
        // Getting the current token ID
        uint256 newTokenId = _tokenIds.current();
        // Minting a new ERC721 token to the sender with the new token ID
        _mint(msg.sender, newTokenId);
        // Setting the token URI for metadata
        _setTokenURI(newTokenId, tokenURI);
        // Creating a market item for the new token
        createMarketItem(newTokenId, price);
        // Returning the new token ID
        return newTokenId;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price
    ) private returns (uint256) {
        // Ensure that the price is greater than 0
        require(price > 0, "Price must be at least 1 wei");
        // Ensure that the sent Ether matches the listing price
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // Create a new MarketItem and store it in the mapping
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        // Transfer the NFT from the creator to the marketplace contract
        _transfer(msg.sender, address(this), tokenId);

        // Emit an event to signify the creation of a new market item
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );

        return tokenId;
    }

    function resellToken(
        uint256 tokenId,
        uint256 price
    ) public payable returns (uint256) {
        // Ensure that the caller is the owner of the NFT
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        // Ensure that the sent Ether matches the listing price
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // Reset the sold flag, update price, and transfer ownership back to the marketplace
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        // Decrement the count of items sold
        _itemsSold.decrement();

        // Transfer the NFT from the owner to the marketplace contract
        _transfer(msg.sender, address(this), tokenId);

        // Emit an event to signify the reselling of the market item
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );

        return tokenId;
    }

    function createMarketSale(
        uint256 tokenId
    ) public payable returns (uint256) {
        // Retrieve the price of the market item
        uint256 price = idToMarketItem[tokenId].price;
        // Retrieve the original seller of the market item
        address payable creator = idToMarketItem[tokenId].seller;

        // Ensure that the sent Ether matches the market item's price
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        // Update ownership and sold status of the market item
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));

        // Increment the count of items sold
        _itemsSold.increment();

        // Transfer the NFT from the marketplace contract to the buyer
        _transfer(address(this), msg.sender, tokenId);

        // Transfer Ether to the marketplace owner and the original seller
        payable(owner).transfer(listingPrice);
        payable(creator).transfer(msg.value);

        // Emit an event to signify the successful market sale
        emit MarketItemCreated(tokenId, msg.sender, address(0), price, true);

        return tokenId;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        // Get the total number of items and unsold items
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;
        // Create an array to store unsold items
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            // Check if the item is listed for sale (owned by the marketplace)
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        // Return the array of unsold items
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            // Check if the item is owned by the caller
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }
        // Create an array to store the caller's owned items
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        // Return the array of caller's owned items
        return items;
    }

    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            // Check if the item is listed by the caller
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        // Create an array to store items listed by the caller
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        // Return the array of items listed by the caller
        return items;
    }

    function fetchSingleNFT(
        uint256 tokenId
    ) public view returns (MarketItem memory) {
        // Retrieve and return information about a single NFT (MarketItem) based on the given tokenId
        MarketItem memory currentItem = idToMarketItem[tokenId];
        return currentItem;
    }
}
