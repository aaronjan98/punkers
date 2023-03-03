import { ethers } from 'ethers'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

const Mint = ({ provider, nft, cost, setIsLoading, pauseMinting, date }) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const [mintAmount, setMintAmount] = useState(1)

  const mintHandler = async e => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      let payment = ethers.BigNumber.from(String(cost * mintAmount))
      const transaction = await nft.connect(signer).mint(mintAmount, {
        value: payment,
      })
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  return (
    <Form
      onSubmit={mintHandler}
      style={{ maxWidth: '450px', margin: '50px auto' }}
    >
      {isWaiting ? (
        <Spinner
          animation="border"
          style={{ display: 'block', margin: '0 auto' }}
        />
      ) : (
        <Form.Group>
          {!pauseMinting && Date.now() > date ? (
            <>
              <Form.Label>Mint Amount</Form.Label>
              <Form.Control
                placeholder="Enter amount of NFTs to mint"
                className="mb-2"
                onChange={e => setMintAmount(e.target.value)}
              />
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
                Mint
              </Button>
            </>
          ) : (
            <>
              <Form.Label>Mint Amount</Form.Label>
              <Form.Control
                placeholder="Enter amount of NFTs to mint"
                className="mb-2"
                disabled
              />
              <Button
                variant="primary"
                type="submit"
                style={{ width: '100%' }}
                disabled
              >
                Mint
              </Button>
            </>
          )}
        </Form.Group>
      )}
    </Form>
  )
}

export default Mint
