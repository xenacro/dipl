const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const IPLedger = await hre.ethers.getContractFactory("IPLedger");
  const ipLeadger = await IPLedger.deploy();
  await ipLeadger.deployed();
  console.log("ipLeadger deployed to:", ipLeadger.address);

  const IP = await hre.ethers.getContractFactory("IP");
  const ip = await IP.deploy(ipLeadger.address);
  await ip.deployed();
  console.log("ip deployed to:", ip.address);

  let config = `
  export const ipmarketaddress = "${ipLeadger.address}"
  export const ipaddress = "${ip.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
