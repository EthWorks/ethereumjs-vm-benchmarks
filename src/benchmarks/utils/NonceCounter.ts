import { Address, makeAddress } from '../../chain/model/primitives'
import { Wallet } from 'ethers'

export async function createNonceCounter (wallets: Wallet[]) {
  const nonces = new Map<Address, number>()
  for (const wallet of wallets) {
    nonces.set(makeAddress(wallet.address), await wallet.getTransactionCount())
  }
  return new NonceCounter(nonces)
}

export class NonceCounter {
  constructor (private nonces = new Map<Address, number>()) {}

  getCurrent (account: Address) {
    const nonce = this.nonces.get(account) ?? 0
    this.nonces.set(account, nonce + 1)
    return nonce
  }
}
