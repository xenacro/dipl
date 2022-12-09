// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract IPLedger is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct LedgerItem {
    uint itemId;
    address ipContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => LedgerItem) private idToLedgerItem;

  event LedgerItemCreated (
    uint indexed itemId,
    address indexed ipContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  
  /* Places an item for sale on the marketplace */
  function createLedgerItem(
    address ipContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToLedgerItem[itemId] =  LedgerItem(
      itemId,
      ipContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    IERC721(ipContract).transferFrom(msg.sender, address(this), tokenId);

    emit LedgerItemCreated(
      itemId,
      ipContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createLedgerSale(
    address ipContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToLedgerItem[itemId].price;
    uint tokenId = idToLedgerItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    idToLedgerItem[itemId].seller.transfer(msg.value);
    IERC721(ipContract).transferFrom(address(this), msg.sender, tokenId);
    idToLedgerItem[itemId].owner = payable(msg.sender);
    idToLedgerItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
  }

  /* Returns all unsold market items */
  function fetchLedgerItems() public view returns (LedgerItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    LedgerItem[] memory items = new LedgerItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToLedgerItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        LedgerItem storage currentItem = idToLedgerItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns onlyl items that a user has purchased */
  function fetchMyNFTs() public view returns (LedgerItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToLedgerItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    LedgerItem[] memory items = new LedgerItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToLedgerItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        LedgerItem storage currentItem = idToLedgerItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (LedgerItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToLedgerItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    LedgerItem[] memory items = new LedgerItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToLedgerItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        LedgerItem storage currentItem = idToLedgerItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}