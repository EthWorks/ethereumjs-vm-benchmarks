const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')
const { run: run03 } = require('./03-erc20-deploys')
const { run: run04 } = require('./04-erc20-calls')
const { run: run05 } = require('./05-erc20-storage')
const { run: run06 } = require('./06-many-storage')

async function benchmark (name, fn, runs) {
  console.time(name)
  await fn(runs)
  console.timeEnd(name)
}

// NOTE: the runs value is experimentally determined to cause 10 seconds of execution
const scale = 1

async function main () {
  await benchmark('01 |   eth-transfers', run01, scale * 300)
  await benchmark('02 | erc20-transfers', run02, scale * 200)
  await benchmark('03 |   erc20-deploys', run03, scale * 125)
  await benchmark('04 |     erc20-calls', run04, scale * 1200)
  await benchmark('05 |   erc20-storage', run05, scale * 200)
  await benchmark('06 |    many-storage', run06, scale * 10)
}

main()