import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { SimpleProvider } from '../../src/benchmarks/SimpleProvider'
import { createSimpleChain, SimpleChain } from '../../src/benchmarks/SimpleChain'
import { deployERC20 } from './utils/deploy'
import { getERC20ApproveTransaction } from './utils/transactions'
import { parseEther } from 'ethers/utils'
import { expect } from 'chai'

describe('ERC20 storage', () => {
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

  it('supports ERC20 token approvals', async () => {
    const other = provider.createEmptyWallet()

    const approveParams = {
      tokenAddress: token.address,
      owner: deployer,
      spender: other,
      amount: parseEther('1'),
    }
    const approve = await getERC20ApproveTransaction(approveParams)
    await chain.sendTransaction(approve)

    const allowance = await token.allowance(deployer.address, other.address)
    expect(allowance.eq(parseEther('1'))).to.be.true
  })

  it('supports multiple ERC20 token approvals', async () => {
    const other = provider.createEmptyWallet()

    const approveParams = {
      tokenAddress: token.address,
      owner: deployer,
      spender: other,
    }

    for (let i = 1; i <= 10; i++) {
      const approve = await getERC20ApproveTransaction({ ...approveParams, amount: parseEther('1').mul(i) })
      await chain.sendTransaction(approve)
    }

    const allowance = await token.allowance(deployer.address, other.address)
    expect(allowance.eq(parseEther('10'))).to.be.true
  })
})