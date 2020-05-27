import VM from '@nomiclabs/ethereumjs-vm'
import { Address, bufferToHash, bufferToHexData, bufferToQuantity, Hash, HexData } from '../model/primitives'
import { Transaction } from 'ethereumjs-tx'
import { putBlock } from '../vm/putBlock'
import { ChainOptions } from '../ChainOptions'
import { initializeVM } from '../vm/initializeVM'
import { toBuffer } from 'ethereumjs-util'
import { runIsolatedTransaction } from '../vm/runIsolatedTransaction'

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

  async runIsolatedTransaction (transaction: Transaction, clockSkew: number) {
    return runIsolatedTransaction(this.vm, transaction, this.options, clockSkew)
  }
}
