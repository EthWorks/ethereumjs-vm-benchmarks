import { SimpleChain, SimpleProvider } from '../chain'
import { measureExecution } from './utils/measureExecution'
import { choose2, randomEthValue } from './utils/random'
import { createNonceCounter } from './utils/NonceCounter'
import { getEthTransferTransaction } from './utils/transactions'

export async function run (runs: number, chain: SimpleChain) {
  const provider = new SimpleProvider(chain)
  const wallets = provider.getWallets()
  const nonceCounter = await createNonceCounter(wallets)

  const signedTransfers = new Array(runs)
  for (let i = 0; i < runs; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    signedTransfers[i] = await getEthTransferTransaction({ from, to, value, nonceCounter })
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      await chain.sendTransaction(signedTransfers[i])
    }
  })
}
