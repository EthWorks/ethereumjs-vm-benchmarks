import { Interface } from 'ethers/utils'
import { toRpcTransactionRequest } from '../../../src/model'
const ERC20Mock = require('../../../contracts/ERC20Mock.json')

export function getERC20BalanceOfCall (tokenAddress: string, accountAddress: string) {
  const erc20Interface = new Interface(ERC20Mock.abi)
  const balanceOfCall = {
    data: erc20Interface.functions.balanceOf.encode([accountAddress]),
    to: tokenAddress,
  }
  return toRpcTransactionRequest(balanceOfCall)
}
