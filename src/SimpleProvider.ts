import { providers, Wallet } from 'ethers'
import { SimpleChain } from './SimpleChain'
import { makeAddress } from './model/primitives'
import { unsupportedOperation } from './errors'
import { toRpcTransactionRequest } from './model'

export class SimpleProvider extends providers.BaseProvider {
  private readonly wallets: Wallet[]

  constructor (private chain: SimpleChain) {
    super({ name: 'simple', chainId: 1337 })
    this.wallets = this.chain.options.accounts.privateKeys
      .map(pk => new Wallet(pk, this))
  }

  getWallets () {
    return this.wallets
  }

  createEmptyWallet () {
    return Wallet.createRandom().connect(this)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async perform (method: string, params: any) {
    switch (method) {
      case 'call':
        return this.chain.call(toRpcTransactionRequest(params.transaction), params.blockTag)
      case 'getCode':
        return this.chain.getCode(makeAddress(params.address), params.blockTag)
      case 'getBalance':
        return this.chain.getBalance(makeAddress(params.address), params.blockTag)
      case 'getBlockNumber':
        return this.chain.getBlockNumber()
      case 'getTransactionCount':
        return this.chain.getTransactionCount(makeAddress(params.address), params.blockTag)
      case 'sendTransaction':
        return this.chain.sendTransaction(params.signedTransaction)
      default:
        throw unsupportedOperation(method)
    }
  }
}
