const { provider } = require('./provider')
const { ContractFactory, utils } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')
const { choose1, randomEthAddress, randomEthValue } = require('./utils/random')

exports.run = async function (runs) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])

  for (let i = 0; i < runs; i++) {
    const token = await erc20Factory.deploy(
      wallets[0].address,
      utils.parseEther('1000000'),
    )

    for (let j = 1; j < wallets.length; j++) {
      await token.transfer(wallets[j].address, utils.parseEther('10000'))
    }

    for (let j = 0; j < 10; j++) {
      const holder = choose1(wallets)
      await token.connect(holder).approve(
        randomEthAddress(),
        randomEthValue(10, 50),
      )
    }
  }
}
