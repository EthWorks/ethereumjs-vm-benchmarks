const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')
const { run: run03 } = require('./03-erc20-deploys')


async function benchmark (name, fn, runs) {
  console.time(name)
  await fn(runs)
  console.timeEnd(name)
}

// NOTE: the runs value is experimentally determined to cause 5 seconds of execution

async function main () {
  await benchmark('01 |   eth-transfers', run01, 137)
  await benchmark('02 | erc20-transfers', run02, 90)
  await benchmark('03 |   erc20-deploys', run03, 63)
}

main()