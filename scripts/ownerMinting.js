const config = require('../src/config.json')
const NFT_ABI = require('../src/abis/NFT.json')

async function main() {
  let accounts, deployer, minter

  // Create the accounts
  accounts = await ethers.getSigners()
  deployer = accounts[0]
  minter = accounts[1]

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()

  // Fetch deployed token
  const nft = await ethers.getContractAt('NFT', config[chainId].nft.address)

  await nft.addToWhitelist(minter.address)

  console.log('whitelisted status: ', await nft.whitelisted(minter.address))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
