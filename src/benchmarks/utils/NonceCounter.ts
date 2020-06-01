import { Address } from '../../chain/model/primitives'

export class NonceCounter {
  private nonces = new Map<Address, number>()

  getNext (account: Address) {
    let nonce = this.nonces.get(account) ?? -1
    this.nonces.set(account, ++nonce)
    return nonce
  }
}
