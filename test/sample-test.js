describe("IPLedger", function() {
  it("Should create and execute ledger sales", async function() {
    const Ledger = await ethers.getContractFactory("IPLedger")
    const ledger = await Ledger.deploy()
    await ledger.deployed()
    const ledgerAddress = ledger.address

    const IP = await ethers.getContractFactory("IP")
    const ip = await IP.deploy(ledgerAddress)
    await ip.deployed()
    const ipContractAddress = ip.address

    let listingPrice = await ledger.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    await ip.createToken("https://www.mytokenlocation.com")
    await ip.createToken("https://www.mytokenlocation2.com")
  
    await ledger.createLedgerItem(ipContractAddress, 1, auctionPrice, { value: listingPrice })
    await ledger.createLedgerItem(ipContractAddress, 2, auctionPrice, { value: listingPrice })
    
    const [_, buyerAddress] = await ethers.getSigners()

    await ledger.connect(buyerAddress).createLedgerSale(ipContractAddress, 1, { value: auctionPrice})

    items = await ledger.fetchLedgerItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await ip.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})
