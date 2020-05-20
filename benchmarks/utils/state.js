const { ContractFactory, utils } = require('ethers')
const { choose1, choose2, randomEthAddress, randomEthValue } = require("./random")
const ERC20Mock = require('../../contracts/ERC20Mock.json')

/**
 * Fill provider with state
 * @param scale multiplier of amount of data to produce
 * @param provider to populate with data
 * @returns {Promise<void>}
 */
exports.fillProviderState = async function (provider, scale) {
  const wallets = provider.getWallets()
  const erc20Factory = new ContractFactory(ERC20Mock.abi, ERC20Mock.bytecode, wallets[0])
  const token = await erc20Factory.deploy(wallets[0].address, utils.parseEther('1000000'))

  // Eth transfers
  for (let i = 0; i < scale * 40; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    await from.sendTransaction({ to: to.address, value })
  }

  // ERC20 transfers
  for (let i = 1; i < wallets.length; i++) {
    await token.transfer(wallets[i].address, utils.parseEther('10000'))
  }

  for (let i = 0; i < scale * 25; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    await token.connect(from).transfer(to.address, value)
  }


  // ERC20 deploys
  for (let i = 0; i < scale * 10; i++) {
    const wallet = choose1(wallets)
    const factory = erc20Factory.connect(wallet)
    await factory.deploy(
      wallet.address,
      randomEthValue(40, 500)
    )
  }

  // ERC20 approves
  for (let i = 0; i < scale * 30; i++) {
    const holder = choose1(wallets)
    await token.connect(holder).approve(
      randomEthAddress(),
      randomEthValue(10, 50),
    )
  }

  // Deploys transfers and approves
  for (let i = 0; i < scale; i++) {
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
