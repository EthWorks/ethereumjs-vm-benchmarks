const { ContractFactory, utils } = require('ethers')
const { measureExecution } = require("./utils/measureExecution")
const { choose1, randomEthAddress, randomEthValue } = require('./utils/random')
const ERC20Mock = require('../../contracts/ERC20Mock.json')

const numApprovals = 10
const oneMillionEth = utils.parseEther('1000000')
const tenThousandEth = utils.parseEther('10000')

exports.run = async function (runs, provider) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])

  const data = new Array(runs)

  for (let i = 0; i < runs; i++) {
    data[i] = new Array(numApprovals)

    for (let j = 0; j < numApprovals; j++) {
      data[i][j] = {
        holder: choose1(wallets),
        spender: randomEthAddress(),
        value: randomEthValue(10, 50)
      }
    }
  }

  return measureExecution(async function () {
    for (let i = 0; i < runs; i++) {
      const token = await erc20Factory.deploy(wallets[0].address, oneMillionEth)

      for (let j = 1; j < wallets.length; j++) {
        await token.transfer(wallets[j].address, tenThousandEth)
      }

      for (let j = 0; j < numApprovals; j++) {
        const { holder, spender, value } = data[i][j]
        await token.connect(holder).approve(spender, value)
      }
    }
  })
}
