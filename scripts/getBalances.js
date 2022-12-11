const config = require('../src/config.json')
const NFT_ABI = require('../src/abis/NFT.json')

async function main() {
  let accounts, deployer, minter

  // Create the accounts
  accounts = await ethers.getSigners()
  deployer = accounts[0]
  minter = accounts[1]

  // print all users balances
  for (let i = 0; i < accounts.length; i++) {
    account = accounts[i].address
    deployerBalance = await ethers.provider.getBalance(account)
    // console.log(
    //   `${i}: 0x...${account
    //     .toString()
    //     .slice(37, 42)} ${await ethers.utils.formatEther(
    //     deployerBalance.toString()
    //   )}`
    // )
    console.log(
      `${i}: ${account} ${await ethers.utils.formatEther(
        deployerBalance.toString()
      )}`
    )
  }

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()

  // Fetch deployed token
  const nft = await ethers.getContractAt('NFT', config[chainId].nft.address)
  // console.log(`NFT fetched: ${nft.address}\n`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
