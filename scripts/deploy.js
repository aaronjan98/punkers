// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')

async function main() {
  const NAME = 'Punkers'
  const SYMBOL = 'PK'
  const COST = ethers.utils.parseEther('10')
  const MAX_SUPPLY = 25
  // const NFT_MINT_DATE = (Date.now() + 120000).toString().slice(0, 10)
  const NFT_MINT_DATE = '1675929600' // Feb 9th 2023
  const IPFS_METADATA_URI =
    'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  // Deploy Token
  const NFT = await hre.ethers.getContractFactory('NFT')
  let nft = await NFT.deploy(
    NAME,
    SYMBOL,
    COST,
    MAX_SUPPLY,
    NFT_MINT_DATE,
    IPFS_METADATA_URI
  )

  await nft.deployed()
  console.log(`\nNFT deployed to: ${nft.address}\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
