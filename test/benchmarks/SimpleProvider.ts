import { expect } from 'chai'
import { providers, utils, Wallet } from 'ethers'
import { createSimpleProvider } from "../../src/benchmarks/SimpleProvider"
import { DEFAULT_CHAIN_OPTIONS } from "../../src"

async function createRawEthTransfer (from: Wallet, to: Wallet) {
  const transaction: providers.TransactionRequest = {
    to: to.address,
    value: utils.parseEther('10'),
    nonce: from.getTransactionCount('pending'),
    chainId: DEFAULT_CHAIN_OPTIONS.chainId,
    gasPrice: utils.bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
    gasLimit: utils.bigNumberify(21000),
  }

  const signedTransaction = await from.sign(transaction)
  return utils.hexlify(signedTransaction)
}

describe('SimpleProvider', () => {
  it('supports sending ETH transactions', async () => {
    const provider = await createSimpleProvider()
    const [wallet] = provider.getWallets()
    const other = provider.createEmptyWallet()

    const signedTransaction = await createRawEthTransfer(wallet, other)
    await provider.perform('sendTransaction', { signedTransaction })


    expect(await wallet.getTransactionCount()).to.equal(1)

    const balance = await other.getBalance()
    expect(balance.eq(utils.parseEther('10'))).to.equal(true)
  })
})
