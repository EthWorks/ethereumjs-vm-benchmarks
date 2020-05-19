const { ContractFactory, utils } = require('ethers')
const { measureExecution } = require('./utils/measureExecution')
const { choose2, randomEthValue } = require('./utils/random')
const ERC20Mock = require('../contracts/ERC20Mock.json')

exports.run = async function (runs, provider) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const token = await erc20Factory.deploy(wallets[0].address, utils.parseEther('1000000'))

  for (let i = 1; i < wallets.length; i++) {
    await token.transfer(wallets[i].address, utils.parseEther('10000'))
  }

  const data = new Array(runs)

  for (let i = 0; i < runs; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    data[i] = {
      from,
      to,
      value
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      const { from, to, value } = data[i]
      await token.connect(from).transfer(to.address, value)
    }
  })
}
