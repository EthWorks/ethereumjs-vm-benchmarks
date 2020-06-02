import { expect } from 'chai'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { parseEther } from 'ethers/utils'
import { getEthTransferTransaction } from '../../src/benchmarks/utils/transactions'
import { NonceCounter } from '../../src/benchmarks/utils/NonceCounter'

describe('ETH transfers', () => {
  let chain: SimpleChain
  let provider: SimpleProvider
  let nonceCounter: NonceCounter

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain)
    nonceCounter = new NonceCounter()
  })

  it('supports making ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    const transferParams = {
      from: wallet,
      to: other,
      value: parseEther('1'),
      nonceCounter,
    }

    const transfer = await getEthTransferTransaction(transferParams)
    await chain.sendTransaction(transfer)

    await expect(wallet.getTransactionCount()).to.eventually.equal(1)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('1'))).to.be.true
  })

  it('supports sending multiple ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    const transferParams = {
      from: wallet,
      to: other,
      value: parseEther('1'),
      nonceCounter,
    }

    for (let i = 0; i < 10; i++) {
      const transfer = await getEthTransferTransaction(transferParams)
      await chain.sendTransaction(transfer)
    }

    await expect(wallet.getTransactionCount()).to.eventually.equal(10)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('10'))).to.be.true
  })
})
