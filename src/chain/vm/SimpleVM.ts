import VM from '@nomiclabs/ethereumjs-vm'
import { Address, bufferToHash, bufferToHexData, bufferToQuantity, Hash, HexData, Quantity } from '../model/primitives'
import { Transaction } from 'ethereumjs-tx'
import { putBlock } from './putBlock'
import { ChainOptions } from '../ChainOptions'
import { initializeVM } from './initializeVM'
import { toBuffer } from 'ethereumjs-util'
import { runIsolatedTransaction } from './runIsolatedTransaction'
import { getLatestBlock } from './getLatestBlock'

export class SimpleVM {
  vm!: VM

  get stateManager () {
    return this.vm.pStateManager
  }

  constructor (private options: ChainOptions) {}

  async init () {
    this.vm = await initializeVM(this.options)
  }

  private async getAccount (address: Address) {
    return this.stateManager.getAccount(toBuffer(address))
  }

  async getCode (address: Address) {
    const code = await this.stateManager.getContractCode(toBuffer(address))
    return bufferToHexData(code)
  }

  async getBalance (address: Address) {
    const account = await this.getAccount(address)
    return bufferToQuantity(account.balance)
  }

  async getNonce (address: Address) {
    const account = await this.getAccount(address)
    return bufferToQuantity(account.nonce)
  }

  async getBlockNumber (): Promise<Quantity> {
    const block = await getLatestBlock(this.vm)
    return bufferToQuantity(block.header.number)
  }

  async mineBlockWithTransaction (signedTransaction: HexData, clockSkew: number): Promise<Hash> {
    const transaction = new Transaction(signedTransaction, { common: this.vm._common })
    await putBlock(this.vm, [transaction], this.options, clockSkew)
    return bufferToHash(transaction.hash())
  }

  async runIsolatedTransaction (transaction: Transaction, clockSkew: number) {
    return runIsolatedTransaction(this.vm, transaction, this.options, clockSkew)
  }
}
