import { providers, Wallet } from 'ethers'
import { TestProviderOptions, toTestChainOptions } from "../../test/Chain/TestProviderOptions"
import { SimpleChain } from "./SimpleChain"
import { makeAddress } from "../model/primitives"
import { unsupportedOperation } from "../errors"

export async function createSimpleProvider (chainOrOptions?: SimpleChain | TestProviderOptions) {
  const provider = new SimpleProvider(chainOrOptions)
  await provider.init()
  return provider
}

export class SimpleProvider extends providers.BaseProvider {
  private chain: SimpleChain
  private wallets: Wallet[]

  constructor (chainOrOptions?: SimpleChain | TestProviderOptions) {
    super({ name: 'simple', chainId: 1337 })

    if (chainOrOptions instanceof SimpleChain) {
      this.chain = chainOrOptions
    } else {
      this.chain = new SimpleChain(toTestChainOptions(chainOrOptions))
    }
    this.wallets = this.chain.options.accounts.privateKeys
      .map(pk => new Wallet(pk, this))
  }

  getWallets () {
    return this.wallets
  }

  createEmptyWallet () {
    return Wallet.createRandom().connect(this)
  }

  async init () {
    await this.chain.init()
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
