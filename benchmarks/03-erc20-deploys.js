const { provider } = require('./provider')
const { ContractFactory } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')
const { measureExecution } = require("./utils/measureExecution")
const { choose1, randomEthValue } = require('./utils/random')

exports.run = async function (runs) {
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
      initialBalance
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      const { wallet, factory, initialBalance } = data[i]
      await factory.deploy(wallet.address, initialBalance)
    }
  })
}
