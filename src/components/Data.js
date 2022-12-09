import { ethers } from 'ethers'

const Data = ({ maxSupply, totalSupply, cost, balance }) => {
  return (
    <div className="text-center">
      <p>
        <strong>Available to Mint: </strong>
        {maxSupply - totalSupply}
      </p>
      <p>
        <strong>Cost to Mint: </strong>
        {ethers.utils.formatEther(cost.toString())} ETH
      </p>
      <p>
        <strong>You own: </strong>
        {balance.toString()}
      </p>
    </div>
  )
}

export default Data
