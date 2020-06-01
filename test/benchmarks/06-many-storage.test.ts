import { Wallet } from 'ethers'
import { Contract } from 'ethers/contract'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { deployERC20 } from '../../src/benchmarks/utils/deploy'
import { getERC20ApproveTransaction, getERC20TransferTransaction } from '../../src/benchmarks/utils/transactions'
import { parseEther } from 'ethers/utils'
import { randomEthValue } from '../../src/benchmarks/utils/random'
import { expect } from 'chai'
import { NonceCounter } from '../../src/benchmarks/utils/NonceCounter'

describe('Many storage', () => {
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

  async function makeTransfers (deployer: Wallet, rest: Wallet[]) {
    const transferParams = {
      tokenAddress: token.address,
      from: deployer,
      value: parseEther('1'),
      nonceCounter,
    }

    for (const wallet of rest) {
      const transfer = await getERC20TransferTransaction({ ...transferParams, to: wallet })
      await chain.sendTransaction(transfer)
    }
  }

  async function makeApprovals (wallets: Wallet[]) {
    const approveParams = new Array(10)
    for (let i = 0; i < 10; i++) {
      approveParams[i] = {
        tokenAddress: token.address,
        owner: wallets[i],
        spender: provider.createEmptyWallet(),
        amount: randomEthValue(10, 50),
        nonceCounter,
      }
      const approve = await getERC20ApproveTransaction(approveParams[i])
      await chain.sendTransaction(approve)
    }
    return approveParams
  }

  it('supports many sequential operations modifying ERC20 contract storage', async () => {
    const [deployer, ...rest] = provider.getWallets()

    await makeTransfers(deployer, rest)
    const approveParams = await makeApprovals([deployer, ...rest])

    const deployerBalance = await token.balanceOf(deployer.address)
    expect(deployerBalance.eq(parseEther('81'))).to.be.true

    for (const wallet of rest) {
      const balance = await token.balanceOf(wallet.address)
      expect(balance.eq(parseEther('1'))).to.be.true
    }

    for (const param of approveParams) {
      const allowance = await token.allowance(param.owner.address, param.spender.address)
      expect(allowance.eq(param.amount)).to.be.true
    }

    await expect(provider.getBlockNumber()).to.eventually.eq(1 + 19 + 10)
  })
})
