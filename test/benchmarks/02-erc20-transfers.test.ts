import { expect } from 'chai'
import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { parseEther } from 'ethers/utils'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src'
import { getERC20TransferTransaction } from './utils/transactions'
import { deployERC20 } from './utils/deploy'

describe('ERC20 transfers', () => {
  let chain: SimpleChain
  let provider: SimpleProvider
  let deployer: Wallet
  let token: Contract

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain);
    ([deployer] = provider.getWallets())
    token = await deployERC20(deployer, chain)
  })

  it('supports making ERC20 transfers', async () => {
    const other = provider.createEmptyWallet()

    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      to: other,
      value: parseEther('1'),
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
