const { MockProvider } = require('@ethereum-waffle/provider');
const { ContractFactory, utils } = require('ethers')
const ERC20Mock = require('../contracts/ERC20Mock.json')

exports.run = async function () {
  // parameters
  const DEPLOYS = 10
  const TRANSFERS_PER_DEPLOY = 10

  // execution
  const provider = new MockProvider({ hardfork: 'istanbul' })
  const [alice, bob] = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, alice)

  for (let i = 0; i < DEPLOYS; i++) {
    const token = await erc20Factory.deploy(alice.address, utils.parseEther('1000'))

    for (let j = 0; j < TRANSFERS_PER_DEPLOY; j++) {
      const value = utils.parseEther((Math.floor(10 + Math.random() * 30)).toString())
      
      await token.connect(alice).transfer(bob.address, value)
      await token.connect(bob).transfer(alice.address, value.div(2))
    }
  }
}
