import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { deployERC20 } from '../../src/benchmarks/utils/deploy'
import { getERC20ApproveTransaction } from '../../src/benchmarks/utils/transactions'
import { parseEther } from 'ethers/utils'
import { expect } from 'chai'
import { NonceCounter } from '../../src/benchmarks/utils/NonceCounter'

describe('ERC20 storage', () => {
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

  it('supports ERC20 token approvals', async () => {
    const other = provider.createEmptyWallet()

    const approveParams = {
      tokenAddress: token.address,
      owner: deployer,
      spender: other,
      amount: parseEther('1'),
      nonceCounter,
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
      nonceCounter,
    }

    for (let i = 1; i <= 10; i++) {
      const approve = await getERC20ApproveTransaction({ ...approveParams, amount: parseEther('1').mul(i) })
      await chain.sendTransaction(approve)
    }

    const allowance = await token.allowance(deployer.address, other.address)
    expect(allowance.eq(parseEther('10'))).to.be.true
  })
})
