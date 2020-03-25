const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')

async function benchmark (name, fn) {
  console.time(name)
  await fn()
  console.timeEnd(name)
}

async function main () {
  await benchmark('01 |   eth-transfers', run01)
  await benchmark('02 | erc20-transfers', run02)
}

main()