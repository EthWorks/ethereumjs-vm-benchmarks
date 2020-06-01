import { Contract, Wallet } from 'ethers'
import { parseEther } from 'ethers/utils'
import { getERC20DeploymentTransaction } from './transactions'
import { SimpleChain } from '../../chain'
import { NonceCounter } from './NonceCounter'

const ERC20Mock = require('../../../contracts/ERC20Mock.json')

export async function deployERC20 (deployer: Wallet, chain: SimpleChain, nonceCounter: NonceCounter) {
  const deployParams = {
    deployer,
    initialAccount: deployer.address,
    initialBalance: parseEther('100'),
    nonceCounter,
  }
  const { deployment, futureAddress } = await getERC20DeploymentTransaction(deployParams)
  await chain.sendTransaction(deployment)
  return new Contract(futureAddress, ERC20Mock.abi, deployer)
}