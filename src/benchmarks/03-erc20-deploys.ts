import { ContractFactory } from 'ethers'
import { measureExecution } from './utils/measureExecution'
import { choose1, randomEthValue } from './utils/random'
import { SimpleChain, SimpleProvider } from '../chain'

const ERC20Mock = require('../../contracts/ERC20Mock.json')

export async function run (runs: number, chain: SimpleChain) {
  const provider = new SimpleProvider(chain)
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const data = new Array(runs)

  for (let i = 0; i < runs; i++) {
    const wallet = choose1(wallets)
    const factory = erc20Factory.connect(wallet)
    const initialBalance = randomEthValue(40, 500)
    data[i] = {
      wallet,
      factory,
      initialBalance,
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      const { wallet, factory, initialBalance } = data[i]
      await factory.deploy(wallet.address, initialBalance)
    }
  })
}
