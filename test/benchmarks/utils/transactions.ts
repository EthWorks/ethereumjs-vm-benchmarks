import { DEFAULT_CHAIN_OPTIONS, makeHexData } from '../../../src'
import { ContractFactory, Wallet } from 'ethers'
import { BigNumber, bigNumberify, getContractAddress, Interface } from 'ethers/utils'
import { TransactionRequest } from 'ethers/providers'

const ERC20Mock = require('../../../contracts/ERC20Mock.json')

export async function getEthTransferTransaction (from: Wallet, to: Wallet, value: BigNumber) {
  const nonce = await from.getTransactionCount()
  const transaction: TransactionRequest = {
    to: to.address,
    value,
    nonce,
    chainId: DEFAULT_CHAIN_OPTIONS.chainId,
    gasPrice: bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
    gasLimit: 21000,
  }

  const signedTransaction = await from.sign(transaction)
  return makeHexData(signedTransaction)
}

interface DeploymentParams {
  deployer: Wallet,
  initialAccount: string,
  initialBalance: BigNumber,
}

export async function getERC20DeploymentTransaction ({ deployer, initialAccount, initialBalance }: DeploymentParams) {
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, deployer)
  const { data } = erc20Factory.getDeployTransaction(initialAccount, initialBalance)
  const nonce = await deployer.getTransactionCount()

  const deployTransaction: TransactionRequest = {
    data,
    nonce,
    chainId: DEFAULT_CHAIN_OPTIONS.chainId,
    gasPrice: bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
    gasLimit: bigNumberify(DEFAULT_CHAIN_OPTIONS.blockGasLimit.toString()),
  }
  const signedDeploy = await deployer.sign(deployTransaction)

  return {
    deployment: makeHexData(signedDeploy),
    futureAddress: getContractAddress({ from: deployer.address, nonce }),
  }
}

interface TransferParams {
  tokenAddress: string,
  from: Wallet,
  to: Wallet,
  value: BigNumber,
}

export async function getERC20TransferTransaction ({ from, to, tokenAddress, value }: TransferParams) {
  const erc20Interface = new Interface(ERC20Mock.abi)
  const transferTransaction: TransactionRequest = {
    to: tokenAddress,
    data: erc20Interface.functions.transfer.encode([to.address, value]),
    nonce: await from.getTransactionCount(),
    chainId: DEFAULT_CHAIN_OPTIONS.chainId,
    gasPrice: bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
    gasLimit: bigNumberify(DEFAULT_CHAIN_OPTIONS.blockGasLimit.toString()),
  }

  const signedTransfer = await from.sign(transferTransaction)
  return makeHexData(signedTransfer)
}
