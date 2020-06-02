import { measureExecution } from './utils/measureExecution'
import { choose2, randomEthValue } from './utils/random'
import { SimpleChain, SimpleProvider } from '../chain'
import { createNonceCounter } from './utils/NonceCounter'
import { getERC20DeployTransaction, getERC20TransferTransaction } from './utils/transactions'
import { parseEther } from 'ethers/utils'

export async function run (runs: number, chain: SimpleChain) {
  const provider = new SimpleProvider(chain)
  const wallets = provider.getWallets()
  const nonceCounter = await createNonceCounter(wallets)

  // Deploy ERC20
  const deployParams = {
    deployer: wallets[0],
    initialAccount: wallets[0].address,
    initialBalance: parseEther('1000000'),
    nonceCounter,
  }
  const { deployment, futureAddress: tokenAddress } = await getERC20DeployTransaction(deployParams)
  await chain.sendTransaction(deployment)

  // Supply each remaining wallet with initial token balance
  for (let i = 1; i < wallets.length; i++) {
    const transferParams = {
      tokenAddress,
      from: wallets[0],
      to: wallets[i],
      value: parseEther('10000'),
      nonceCounter,
    }
    const initialTransfer = await getERC20TransferTransaction(transferParams)
    await chain.sendTransaction(initialTransfer)
  }

  // Prepare data for benchmark execution
  const signedTransfers = new Array(runs)
  for (let i = 0; i < runs; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    signedTransfers[i] = await getERC20TransferTransaction({ from, to, tokenAddress, value, nonceCounter })
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      await chain.sendTransaction(signedTransfers[i])
    }
  })
}
