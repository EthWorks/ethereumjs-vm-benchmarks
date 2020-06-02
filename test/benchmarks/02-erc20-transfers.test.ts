import { expect } from 'chai'
import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { parseEther } from 'ethers/utils'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { getERC20TransferTransaction } from '../../src/benchmarks/utils/transactions'
import { deployERC20 } from '../../src/benchmarks/utils/deploy'
import { NonceCounter } from '../../src/benchmarks/utils/NonceCounter'

describe('ERC20 transfers', () => {
  let chain: SimpleChain
  let provider: SimpleProvider
  let deployer: Wallet
  let token: Contract
  let nonceCounter: NonceCounter

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain);
    ([deployer] = provider.getWallets())
    nonceCounter = new NonceCounter()
    token = await deployERC20(deployer, chain, nonceCounter)
  })

  it('supports making ERC20 transfers', async () => {
    const other = provider.createEmptyWallet()

    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      to: other,
      value: parseEther('1'),
      nonceCounter,
    }
    const transfer = await getERC20TransferTransaction(transferParams)
    await chain.sendTransaction(transfer)

    const deployerBalance = await token.balanceOf(deployer.address)
    const otherBalance = await token.balanceOf(other.address)

    expect(deployerBalance.eq(parseEther('99'))).to.be.true
    expect(otherBalance.eq(parseEther('1'))).to.be.true
  })

  it('supports multiple ERC20 transfers', async () => {
    const [deployer, other] = provider.getWallets()

    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      to: other,
      value: parseEther('2'),
      nonceCounter,
    }
    for (let i = 0; i < 5; i++) {
      const transfer = await getERC20TransferTransaction(transferParams)
      await chain.sendTransaction(transfer)
    }

    const refundParams = {
      tokenAddress: token.address,
      from: other,
      to: deployer,
      value: parseEther('1'),
      nonceCounter,
    }
    for (let i = 0; i < 5; i++) {
      const refundTransfer = await getERC20TransferTransaction(refundParams)
      await chain.sendTransaction(refundTransfer)
    }

    const deployerBalance = await token.balanceOf(deployer.address)
    const otherBalance = await token.balanceOf(other.address)

    expect(deployerBalance.eq(parseEther('95'))).to.be.true
    expect(otherBalance.eq(parseEther('5'))).to.be.true
  })
})
