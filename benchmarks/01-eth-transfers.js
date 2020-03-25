const { MockProvider } = require('@ethereum-waffle/provider')
const { choose2, randomEthValue } = require('./utils')

exports.run = async function (runs) {
  const provider = new MockProvider({ hardfork: 'istanbul' })
  const wallets = provider.getWallets()

  for (let i = 0; i < runs; i++) {
    const [from, to] = choose2(wallets)
    const value = randomEthValue(1, 15)
    await from.sendTransaction({ to: to.address, value })
  }
}
