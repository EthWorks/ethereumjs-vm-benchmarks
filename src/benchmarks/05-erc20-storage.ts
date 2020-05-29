import { SimpleProvider } from '../chain'
import { ContractFactory, utils } from 'ethers'
import { measureExecution } from './utils/measureExecution'
import { choose1, randomEthAddress, randomEthValue } from './utils/random'

const ERC20Mock = require('../../contracts/ERC20Mock.json')

export async function run (runs: number, provider: SimpleProvider) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const token = await erc20Factory.deploy(wallets[0].address, utils.parseEther('1000000'))

  for (let i = 1; i < wallets.length; i++) {
    await token.transfer(wallets[i].address, utils.parseEther('10000'))
  }

  const data = new Array(runs)

  for (let i = 0; i < runs; i++) {
    data[i] = {
      holder: choose1(wallets),
      spender: randomEthAddress(),
      value: randomEthValue(10, 50),
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      const { holder, spender, value } = data[i]
      await token.connect(holder).approve(spender, value)
    }
  })
}
