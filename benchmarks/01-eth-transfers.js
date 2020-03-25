const { MockProvider } = require('@ethereum-waffle/provider')
const { utils } = require('ethers')

exports.run = async function () {
  // parameters
  const RUNS = 100

  // execution
  const provider = new MockProvider({ hardfork: 'istanbul' })
  const [alice, bob] = provider.getWallets()

  for (let i = 0; i < RUNS; i++) {
    const value = utils.parseEther((Math.floor(50 + Math.random() * 100)).toString())
    await alice.sendTransaction({ to: bob.address, value })
    await bob.sendTransaction({ to: alice.address, value })
  }
}
