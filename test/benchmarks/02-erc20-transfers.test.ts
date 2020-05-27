import { expect } from 'chai'
import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { parseEther } from 'ethers/utils'
import { SimpleProvider } from '../../src/benchmarks/SimpleProvider'
import { createSimpleChain, SimpleChain } from '../../src/benchmarks/SimpleChain'
import { getERC20TransferTransaction } from './utils/transactions'
import { deployERC20 } from './utils/deploy'

describe('ERC20 Transfers', () => {
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
    const other = provider.createEmptyWallet()

    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      to: other,
      value: parseEther('1'),
    }

    for (let i = 0; i < 10; i++) {
      const transfer = await getERC20TransferTransaction(transferParams)
      await chain.sendTransaction(transfer)
    }

    const deployerBalance = await token.balanceOf(deployer.address)
    const otherBalance = await token.balanceOf(other.address)

    expect(deployerBalance.eq(parseEther('90'))).to.be.true
    expect(otherBalance.eq(parseEther('10'))).to.be.true
  })
})
