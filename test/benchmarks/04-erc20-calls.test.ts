import { expect } from 'chai'
import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { parseEther } from 'ethers/utils'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { deployERC20 } from './utils/deploy'
import { getERC20BalanceOfCall } from './utils/calls'
import { getERC20TransferTransaction } from './utils/transactions'

describe('ERC20 calls', () => {
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

  it('supports balanceOf calls', async () => {
    const other = provider.createEmptyWallet()
    const empty = provider.createEmptyWallet()

    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      to: other,
      value: parseEther('1'),
    }
    const transfer = await getERC20TransferTransaction(transferParams)
    await chain.sendTransaction(transfer)

    const balanceOfDeployer = getERC20BalanceOfCall(token.address, deployer.address)
    const hexDeployerBalance = await chain.call(balanceOfDeployer, 'latest')
    expect(parseEther('99').eq(hexDeployerBalance)).to.be.true

    const balanceOfOther = getERC20BalanceOfCall(token.address, other.address)
    const hexOtherBalance = await chain.call(balanceOfOther, 'latest')
    expect(parseEther('1').eq(hexOtherBalance)).to.be.true

    const balanceOfEmpty = getERC20BalanceOfCall(token.address, empty.address)
    const hexEmptyBalance = await chain.call(balanceOfEmpty, 'latest')
    expect(parseEther('0').eq(hexEmptyBalance)).to.be.true
  })

  it('supports multiple balanceOf calls', async () => {
    for (let i = 0; i < 10; i++) {
      const balanceOf = getERC20BalanceOfCall(token.address, deployer.address)
      const hexBalance = await chain.call(balanceOf, 'latest')
      expect(parseEther('100').eq(hexBalance)).to.be.true
    }
  })
})
