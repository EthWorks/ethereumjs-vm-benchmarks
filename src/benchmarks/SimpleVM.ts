import VM from '@nomiclabs/ethereumjs-vm'
import { Address, bufferToHash, bufferToQuantity, Hash, HexData } from "../model/primitives"
import { Transaction } from 'ethereumjs-tx'
import { putBlock } from "../vm/putBlock"
import { ChainOptions } from "../ChainOptions"
import { initializeVM } from "../vm/initializeVM"
import { toBuffer } from 'ethereumjs-util'

export class SimpleVM {
  vm!: VM
  pendingTransactions: Transaction[] = []

  get stateManager () {
    return this.vm.pStateManager
  }

  constructor (private options: ChainOptions) {}

  async init () {
    this.vm = await initializeVM(this.options)
  }

  async getNonce (address: Address) {
    const account = await this.getAccount(address)
    return bufferToQuantity(account.nonce)
  }

  async getBalance (address: Address) {
    const account = await this.getAccount(address)
    return bufferToQuantity(account.balance)
  }

  private async getAccount (address: Address) {
    return this.stateManager.getAccount(toBuffer(address))
  }

  async addPendingTransaction (signedTransaction: HexData): Promise<Hash> {
    const transaction = new Transaction(signedTransaction, { common: this.vm._common })
    this.pendingTransactions.push(transaction)
    return bufferToHash(transaction.hash())
  }

  async mineBlock (clockSkew: number) {
    const transactions = this.pendingTransactions
    this.pendingTransactions = []

    await putBlock(this.vm, transactions, this.options, clockSkew)
  }
}
