import { measureExecution } from './utils/measureExecution'
import { choose1, randomEthValue } from './utils/random'
import { SimpleChain, SimpleProvider } from '../chain'
import { createNonceCounter } from './utils/NonceCounter'
import { getERC20DeployTransaction } from './utils/transactions'

export async function run (runs: number, chain: SimpleChain) {
  const provider = new SimpleProvider(chain)
  const wallets = provider.getWallets()
  const nonceCounter = await createNonceCounter(wallets)

  // Prepare data for benchmark execution
  const signedDeploys = new Array(runs)
  for (let i = 0; i < runs; i++) {
    const wallet = choose1(wallets)
    const initialBalance = randomEthValue(40, 500)
    const deployParams = {
      deployer: wallet,
      initialAccount: wallet.address,
      initialBalance,
      nonceCounter,
    }
    const erc20 = await getERC20DeployTransaction(deployParams)
    signedDeploys[i] = erc20.deployment
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      await chain.sendTransaction(signedDeploys[i])
    }
  })
}
