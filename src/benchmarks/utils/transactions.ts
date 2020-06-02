import { DEFAULT_CHAIN_OPTIONS, makeAddress, makeHexData } from '../../chain'
import { ContractFactory, Wallet } from 'ethers'
import { BigNumber, bigNumberify, getContractAddress, Interface } from 'ethers/utils'
import { TransactionRequest } from 'ethers/providers'
import { NonceCounter } from './NonceCounter'

const ERC20Mock = require('../../../contracts/ERC20Mock.json')
const erc20Interface = new Interface(ERC20Mock.abi)
const transactionDefaults: TransactionRequest = {
  chainId: DEFAULT_CHAIN_OPTIONS.chainId,
  gasPrice: bigNumberify(DEFAULT_CHAIN_OPTIONS.defaultGasPrice.toString()),
  gasLimit: bigNumberify(DEFAULT_CHAIN_OPTIONS.blockGasLimit.toString()),
}

interface EthTransferParams {
  from: Wallet,
  to: Wallet,
  value: BigNumber,
  nonceCounter: NonceCounter,
}

export async function getEthTransferTransaction ({ from, to, value, nonceCounter }: EthTransferParams) {
  const transaction: TransactionRequest = {
    ...transactionDefaults,
    to: to.address,
    value,
    nonce: nonceCounter.getCurrent(makeAddress(from.address)),
    gasLimit: 21000,
  }

  const signedTransaction = await from.sign(transaction)
  return makeHexData(signedTransaction)
}

interface DeployParams {
  deployer: Wallet,
  initialAccount: string,
  initialBalance: BigNumber,
  nonceCounter: NonceCounter,
}

export async function getERC20DeployTransaction (params: DeployParams) {
  const { deployer, initialAccount, initialBalance, nonceCounter } = params

  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, deployer)
  const { data } = erc20Factory.getDeployTransaction(initialAccount, initialBalance)
  const nonce = nonceCounter.getCurrent(makeAddress(deployer.address))

  const deployTransaction: TransactionRequest = {
    ...transactionDefaults,
    data,
    nonce,
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
  nonceCounter: NonceCounter,
}

export async function getERC20TransferTransaction ({ from, to, tokenAddress, value, nonceCounter }: TransferParams) {
  const transferTransaction: TransactionRequest = {
    ...transactionDefaults,
    to: tokenAddress,
    data: erc20Interface.functions.transfer.encode([to.address, value]),
    nonce: nonceCounter.getCurrent(makeAddress(from.address)),
  }

  const signedTransfer = await from.sign(transferTransaction)
  return makeHexData(signedTransfer)
}

interface ApproveParams {
  tokenAddress: string,
  owner: Wallet,
  spender: Wallet,
  amount: BigNumber,
  nonceCounter: NonceCounter,
}

export async function getERC20ApproveTransaction (params: ApproveParams) {
  const { tokenAddress, owner, spender, amount, nonceCounter } = params

  const approveTransaction: TransactionRequest = {
    ...transactionDefaults,
    to: tokenAddress,
    data: erc20Interface.functions.approve.encode([spender.address, amount]),
    nonce: nonceCounter.getCurrent(makeAddress(owner.address)),
  }
  const signedApprove = await owner.sign(approveTransaction)
  return makeHexData(signedApprove)
}
