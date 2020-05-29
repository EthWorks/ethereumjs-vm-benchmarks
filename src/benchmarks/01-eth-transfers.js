const { measureExecution } = require('./utils/measureExecution')
const { choose2, randomEthValue } = require('./utils/random')

exports.run = async function (runs, provider) {
  const wallets = provider.getWallets()
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
      await from.sendTransaction({ to: to.address, value })
    }
  })
}
