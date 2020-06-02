import { utils } from 'ethers'
import { measureExecution } from './utils/measureExecution'
import { choose1, randomEthValue } from './utils/random'
import { SimpleChain, SimpleProvider } from '../chain'
import { createNonceCounter } from './utils/NonceCounter'
import {
  getERC20ApproveTransaction,
  getERC20DeployTransaction,
  getERC20TransferTransaction,
} from './utils/transactions'

const numApprovals = 10
const oneMillionEth = utils.parseEther('1000000')
const tenThousandEth = utils.parseEther('10000')

export async function run (runs: number, chain: SimpleChain) {
  const provider = new SimpleProvider(chain)
  const wallets = provider.getWallets()
  const nonceCounter = await createNonceCounter(wallets)

  // Prepare data for benchmark execution
  const signedTransactions = new Array(runs)

  for (let i = 0; i < runs; i++) {
    signedTransactions[i] = {}

    // ERC20 deployment transaction
    const deployParams = {
      deployer: wallets[0],
      initialAccount: wallets[0].address,
      initialBalance: oneMillionEth,
      nonceCounter,
    }
    const erc20 = await getERC20DeployTransaction(deployParams)
    signedTransactions[i].deployment = erc20.deployment

    // ERC20 transfer transactions
    signedTransactions[i].transfers = new Array(wallets.length - 1)
    for (let j = 0; j < wallets.length - 1; j++) {
      const transferParams = {
        tokenAddress: erc20.futureAddress,
        from: wallets[0],
        to: wallets[j + 1],
        value: tenThousandEth,
        nonceCounter,
      }
      signedTransactions[i].transfers[j] = await getERC20TransferTransaction(transferParams)
    }

    // ERC20 approve transactions
    signedTransactions[i].approves = new Array(numApprovals)
    for (let j = 0; j < numApprovals; j++) {
      const approveParams = {
        tokenAddress: erc20.futureAddress,
        owner: choose1(wallets),
        spender: provider.createEmptyWallet(),
        amount: randomEthValue(10, 50),
        nonceCounter,
      }
      signedTransactions[i].approves[j] = await getERC20ApproveTransaction(approveParams)
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      await chain.sendTransaction(signedTransactions[i].deployment)

      for (let j = 0; j < wallets.length - 1; j++) {
        await chain.sendTransaction(signedTransactions[i].transfers[j])
      }

      for (let j = 0; j < numApprovals; j++) {
        await chain.sendTransaction(signedTransactions[i].approves[j])
      }
    }
  })
}
