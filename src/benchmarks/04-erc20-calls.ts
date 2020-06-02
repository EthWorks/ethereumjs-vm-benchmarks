import { SimpleChain, SimpleProvider } from '../chain'
import { measureExecution } from './utils/measureExecution'
import { choose1 } from './utils/random'
import { createNonceCounter } from './utils/NonceCounter'
import { getERC20DeployTransaction, getERC20TransferTransaction } from './utils/transactions'
import { parseEther } from 'ethers/utils'
import { getERC20BalanceOfCall } from './utils/calls'

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

  const balanceOfCalls = new Array(runs)
  for (let i = 0; i < runs; i++) {
    const wallet = choose1(wallets)
    balanceOfCalls[i] = getERC20BalanceOfCall(tokenAddress, wallet.address)
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      await chain.call(balanceOfCalls[i], 'latest')
    }
  })
}
