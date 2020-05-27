import { expect } from 'chai'
import { Wallet } from 'ethers'
import { SimpleProvider } from "../../src/benchmarks/SimpleProvider"
import { DEFAULT_CHAIN_OPTIONS, makeHexData } from "../../src"
import { createSimpleChain, SimpleChain } from "../../src/benchmarks/SimpleChain"
import { BigNumber, bigNumberify, parseEther } from 'ethers/utils'
import { TransactionRequest } from 'ethers/providers'

async function createRawEthTransfer (from: Wallet, to: Wallet, value: BigNumber) {
  const transaction: TransactionRequest = {
    to: to.address,
    value,
    nonce: from.getTransactionCount('pending'),
    chainId: DEFAULT_CHAIN_OPTIONS.chainId,
    gasPrice: bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
    gasLimit: bigNumberify(21000),
  }

  const signedTransaction = await from.sign(transaction)
  return makeHexData(signedTransaction)
}

describe('ETH Transfers', () => {
  let chain: SimpleChain
  let provider: SimpleProvider

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain)
  });

  it('supports sending ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    const transfer = await createRawEthTransfer(wallet, other, parseEther('1'))
    await chain.sendTransaction(transfer)

    await expect(wallet.getTransactionCount()).to.eventually.equal(1)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('1'))).to.be.true
  })

  it('supports sending multiple ETH transfers', async () => {
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    for (let i = 0; i < 10; i++) {
      const transfer = await createRawEthTransfer(wallet, other, parseEther('1'))
      await chain.sendTransaction(transfer)
    }

    await expect(wallet.getTransactionCount()).to.eventually.equal(10)
    const balance = await other.getBalance()
    expect(balance.eq(parseEther('10'))).to.be.true
  });
})
