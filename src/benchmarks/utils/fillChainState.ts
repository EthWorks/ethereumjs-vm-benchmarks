import { SimpleChain, SimpleProvider } from '../../chain'
import { choose1, choose2, randomEthValue } from './random'
import { createNonceCounter } from './NonceCounter'
import {
  getERC20ApproveTransaction,
  getERC20DeployTransaction,
  getERC20TransferTransaction,
  getEthTransferTransaction
} from './transactions'
import { parseEther } from 'ethers/utils'

/**
 * Fill blockchain with state
 * @param scale multiplier of amount of data to produce
 * @param chain to populate with data
 * @returns {Promise<void>}
 */
export async function fillChainState (chain: SimpleChain, scale: number) {
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

  // Eth transfers
  for (let i = 0; i < scale * 40; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    const transfer = await getEthTransferTransaction({ from, to, value, nonceCounter })
    await chain.sendTransaction(transfer)
  }

  // ERC20 transfers
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

  for (let i = 0; i < scale * 25; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    const transfer = await getERC20TransferTransaction({ from, to, tokenAddress, value, nonceCounter })
    await chain.sendTransaction(transfer)
  }

  // ERC20 deploys
  for (let i = 0; i < scale * 10; i++) {
    const wallet = choose1(wallets)
    const initialBalance = randomEthValue(40, 500)
    const deployParams = {
      deployer: wallet,
      initialAccount: wallet.address,
      initialBalance,
      nonceCounter,
    }
    const erc20 = await getERC20DeployTransaction(deployParams)
    await chain.sendTransaction(erc20.deployment)
  }

  // ERC20 approves
  for (let i = 0; i < scale * 30; i++) {
    const owner = choose1(wallets)
    const spender = provider.createEmptyWallet()
    const amount = randomEthValue(10, 50)
    const approve = await getERC20ApproveTransaction({ tokenAddress, owner, spender, amount, nonceCounter })
    await chain.sendTransaction(approve)
  }

  // Deploys transfers and approves
  for (let i = 0; i < scale; i++) {
    const deployParams = {
      deployer: wallets[0],
      initialAccount: wallets[0].address,
      initialBalance: parseEther('1000000'),
      nonceCounter,
    }
    const erc20 = await getERC20DeployTransaction(deployParams)
    await chain.sendTransaction(erc20.deployment)

    for (let j = 0; j < wallets.length - 1; j++) {
      const transferParams = {
        tokenAddress: erc20.futureAddress,
        from: wallets[0],
        to: wallets[j + 1],
        value: parseEther('10000'),
        nonceCounter,
      }
      const transfer = await getERC20TransferTransaction(transferParams)
      await chain.sendTransaction(transfer)
    }

    for (let j = 0; j < 10; j++) {
      const approveParams = {
        tokenAddress: erc20.futureAddress,
        owner: choose1(wallets),
        spender: provider.createEmptyWallet(),
        amount: randomEthValue(10, 50),
        nonceCounter,
      }
      const approve = await getERC20ApproveTransaction(approveParams)
      await chain.sendTransaction(approve)
    }
  }
}
