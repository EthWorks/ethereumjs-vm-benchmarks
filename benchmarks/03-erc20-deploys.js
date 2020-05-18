const { provider } = require('./provider')
const { ContractFactory } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')
const { choose1, randomEthValue } = require('./utils/random')

exports.run = async function (runs) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])

  for (let i = 0; i < runs; i++) {
    const wallet = choose1(wallets)
    const factory = erc20Factory.connect(wallet)
    await factory.deploy(
      wallet.address,
      randomEthValue(40, 500)
    )
  }
}
