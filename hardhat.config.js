require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle")
const fs = require('fs');
const privateKey = fs.readFileSync(".secret", "utf-8").toString();
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
 mumbai: {
   url: "https://polygon-mumbai.infura.io/v3/63cfabaff14c4ae3903559b808eff280",
   accounts: [privateKey]
 }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
/** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.17",
// };
