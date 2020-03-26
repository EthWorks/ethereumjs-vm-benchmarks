const { provider } = require('./provider')
const { ContractFactory, utils } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')
const { choose1, randomEthAddress, randomEthValue } = require('./utils')

exports.run = async function (runs) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const token = await erc20Factory.deploy(wallets[0].address, utils.parseEther('1000000'))

  for (let i = 1; i < wallets.length; i++) {
    await token.transfer(wallets[i].address, utils.parseEther('10000'))
  }

  for (let i = 0; i < runs; i++) {
    const holder = choose1(wallets)
    await token.connect(holder).approve(
      randomEthAddress(),
      randomEthValue(10, 50),
    )
  }
}
