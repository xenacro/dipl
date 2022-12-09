import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  ipaddress, ipledgeraddress
} from '../config'

import IP from '../artifacts/contracts/IP.sol/IP.json'
import IPLedger from '../artifacts/contracts/IPLedger.sol/IPLedger.json'

// let rpcEndpoint = null

// if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
//   rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
// }

export default function Home() {
  const [ips, setIPs] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadIPs()
  }, [])
  async function loadIPs() {    
    const provider = new ethers.providers.JsonRpcProvider()//rpcEndpoint
    const tokenContract = new ethers.Contract(ipaddress, IP.abi, provider)
    const ledgerContract = new ethers.Contract(ipledgeraddress, IPLedger.abi, provider)
    const data = await ledgerContract.fetchLedgerItems()
    
    const items = await Promise.all(data.map(async (i, idx) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: tokenUri,//meta.data.image,
        name: `Patent ${idx+1}`,
        description: "You have the right to use this patent",
      }
      return item
    }))
    setIPs(items)
    setLoadingState('loaded') 
  }
  async function purchasePatent(ip) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(ipmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(ip.price.toString(), 'ether')
    const transaction = await contract.createLedgerSale(ipaddress, ip.itemId, {
      value: price
    })
    await transaction.wait()
    loadIPs()
  }
  if (loadingState === 'loaded' && !ips.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            ips.map((ip, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={ip.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{ip.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{ip.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{ip.price} ETH</p>
                  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => purchasePatent(ip)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}