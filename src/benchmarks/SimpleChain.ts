import { Address, Hash, HexData, Quantity } from "../model/primitives"
import { ChainOptions, getChainOptionsWithDefaults } from "../ChainOptions"
import { Tag } from "../model"
import { unsupportedBlockTag } from "../errors"
import { SimpleVM } from "./SimpleVM"

export class SimpleChain {
  private vm: SimpleVM
  options: ChainOptions

  constructor (options?: Partial<ChainOptions>) {
    this.options = getChainOptionsWithDefaults(options)
    this.vm = new SimpleVM(this.options)
  }

  async init () {
    await this.vm.init()
  }

  async getBalance (address: Address, blockTag: Quantity | Tag): Promise<Quantity> {
    if (blockTag !== 'latest') {
      throw unsupportedBlockTag('getBalance', blockTag, ['latest'])
    }
    return this.vm.getBalance(address)
  }

  async getTransactionCount (address: Address, blockTag: Quantity | Tag): Promise<Quantity> {
    if (blockTag !== 'latest' && blockTag !== 'pending') {
      throw unsupportedBlockTag('getTransactionCount', blockTag, ['latest', 'pending'])
    }
    return this.vm.getNonce(address)
  }

  async sendTransaction (signedTransaction: HexData): Promise<Hash> {
    const hash = await this.vm.addPendingTransaction(signedTransaction)
    if (this.options.autoMining) {
      await this.vm.mineBlock(this.options.clockSkew)
    }
    return hash
  }
}
