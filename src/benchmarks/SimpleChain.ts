import { Address, bnToQuantity, bufferToHexData, Hash, HexData, Quantity } from '../model/primitives'
import { ChainOptions, getChainOptionsWithDefaults } from '../ChainOptions'
import { RpcTransactionRequest, Tag, toFakeTransaction } from '../model'
import { unsupportedBlockTag } from '../errors'
import { SimpleVM } from './SimpleVM'

export async function createSimpleChain (options?: Partial<ChainOptions>) {
  const chain = new SimpleChain(options)
  await chain.init()
  return chain
}

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

  async getCode (address: Address, blockTag: Quantity | Tag): Promise<HexData> {
    if (blockTag !== 'latest') {
      throw unsupportedBlockTag('getCode', blockTag, ['latest'])
    }
    return this.vm.getCode(address)
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

  async call (transactionRequest: RpcTransactionRequest, blockTag: Quantity | Tag): Promise<HexData> {
    if (blockTag !== 'latest') {
      throw unsupportedBlockTag('call', blockTag, ['latest'])
    }
    const tx = toFakeTransaction({
      ...transactionRequest,
      gas: bnToQuantity(this.options.blockGasLimit),
    })
    const result = await this.vm.runIsolatedTransaction(tx, this.options.clockSkew)
    return bufferToHexData(result.execResult.returnValue)
  }

  async sendTransaction (signedTransaction: HexData): Promise<Hash> {
    const hash = await this.vm.addPendingTransaction(signedTransaction)
    if (this.options.autoMining) {
      await this.vm.mineBlock(this.options.clockSkew)
    }
    return hash
  }
}
