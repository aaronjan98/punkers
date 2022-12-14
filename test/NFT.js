const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = n => {
  return ethers.utils.parseEther(n.toString())
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ether(10)
  const MAX_SUPPLY = 25
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  let nft, deployer, minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]
  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10) // 2 minutes from now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        ALLOW_MINTING_ON,
        BASE_URI
      )
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns the maximum total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })
  })

  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        )

        await nft.connect(deployer).addToWhitelist(minter.address)
        await nft.connect(deployer).addToWhitelist(user1.address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('adds users to whitelist', async () => {
        expect(await nft.whitelisted(minter.address)).to.equal(true)
        expect(await nft.whitelisted(user1.address)).to.equal(true)
        expect(await nft.whitelisted(user2.address)).to.equal(false)
      })

      it('returns the address of the minter', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('returns the status of pauseMinting', async () => {
        expect(await nft.pauseMinting()).to.equal(false)
      })

      it('toggle update minting status', async () => {
        let transaction = await nft.connect(deployer).toggleMinting()
        await transaction.wait()
        expect(await nft.pauseMinting()).to.equal(true)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction)
          .to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })
    })

    describe('Failure', async () => {
      beforeEach(async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        )

        await nft.connect(deployer).addToWhitelist(minter.address)
      })

      it('rejects insufficient payment', async () => {
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be
          .reverted
      })

      it('does not allow minting while minting is paused by the owner', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        )
        let transaction = await nft.connect(deployer).toggleMinting()
        await transaction.wait()

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be
          .reverted
      })

      it('rejects non-whitelisted addresses', async () => {
        await expect(nft.connect(user2).mint(1, { value: COST })).to.be.reverted
      })

      it('require at least 1 NFT to be minted', async () => {
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted
      })

      it('rejects minting before allowed time', async () => {
        const BEFORE_ALLOW_MINTING_ON = new Date('January 1, 2023 00:00:00')
          .getTime()
          .toString()
          .slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          BEFORE_ALLOW_MINTING_ON,
          BASE_URI
        )

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be
          .reverted
      })

      it("doesn't allow more NFTs to be minted than max supply", async () => {
        await expect(nft.connect(minter).mint(100, { value: COST })).to.be
          .reverted
      })

      it('puts a cap on the number of NFTs a user can mint', async () => {
        await expect(nft.connect(minter).mint(4, { value: ether(40) })).to.be
          .reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI('99')).to.be.reverted
      })
    })
  })

  describe('Displaying NFTs', () => {
    let transaction, result

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        ALLOW_MINTING_ON,
        BASE_URI
      )

      await nft.connect(deployer).addToWhitelist(minter.address)
      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('returns all the NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)
      // console.log('owner wallet', tokenIds)
      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })
  })

  describe('Withdraw Ether', () => {
    describe('Success', async () => {
      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        )

        await nft.connect(deployer).addToWhitelist(minter.address)
        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(
          await ethers.provider.getBalance(deployer.address)
        ).to.be.greaterThan(balanceBefore)
      })

      it('emits a withdraw event', async () => {
        expect(transaction)
          .to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)
      })

      it('allows owner to update the NFT price', async () => {
        nft.connect(deployer).setCost(ether(11))
        expect(await nft.cost()).to.equal(ether(11))
      })
    })

    describe('Failure', async () => {
      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        )
        await nft.connect(deployer).addToWhitelist(minter.address)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })
    })
  })
})
