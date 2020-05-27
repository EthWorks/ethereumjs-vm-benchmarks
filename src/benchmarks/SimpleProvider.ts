import { providers, Wallet } from 'ethers'
import { SimpleChain } from "./SimpleChain"
import { makeAddress } from "../model/primitives"
import { unsupportedOperation } from "../errors"

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
      case 'getBalance':
        return this.chain.getBalance(makeAddress(params.address), params.blockTag)
      case 'getTransactionCount':
        return this.chain.getTransactionCount(makeAddress(params.address), params.blockTag)
      case 'sendTransaction':
        return this.chain.sendTransaction(params.signedTransaction)
      default:
        throw unsupportedOperation(method)
    }
  }
}
