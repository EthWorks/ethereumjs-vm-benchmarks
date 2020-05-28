import { expect } from 'chai'
import { SimpleProvider } from '../../src/benchmarks/SimpleProvider'
import { createSimpleChain, SimpleChain } from '../../src/benchmarks/SimpleChain'
import { parseEther } from 'ethers/utils'
import { getEthTransferTransaction } from './utils/transactions'

describe('ETH transfers', () => {
  let chain: SimpleChain
  let provider: SimpleProvider

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain)
  })

  it('supports making ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    const transfer = await getEthTransferTransaction(wallet, other, parseEther('1'))
    await chain.sendTransaction(transfer)

    await expect(wallet.getTransactionCount()).to.eventually.equal(1)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('1'))).to.be.true
  })

  it('supports sending multiple ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    for (let i = 0; i < 10; i++) {
      const transfer = await getEthTransferTransaction(wallet, other, parseEther('1'))
      await chain.sendTransaction(transfer)
    }

    await expect(wallet.getTransactionCount()).to.eventually.equal(10)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('10'))).to.be.true
  })
})
