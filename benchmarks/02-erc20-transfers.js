const { provider } = require('./provider')
const { ContractFactory, utils } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')
const { choose2, randomEthValue } = require('./utils')

exports.run = async function (runs) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const token = await erc20Factory.deploy(wallets[0].address, utils.parseEther('1000000'))

  for (let i = 1; i < wallets.length; i++) {
    await token.transfer(wallets[i].address, utils.parseEther('10000'))
  }

  for (let i = 0; i < runs; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    await token.connect(from).transfer(to.address, value)
  }
}
