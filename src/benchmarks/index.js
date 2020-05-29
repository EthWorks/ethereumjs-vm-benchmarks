const { getEnv } = require("./utils/getEnv")
const { runBenchmark } = require("./benchmark")
const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')
const { run: run03 } = require('./03-erc20-deploys')
const { run: run04 } = require('./04-erc20-calls')
const { run: run05 } = require('./05-erc20-storage')
const { run: run06 } = require('./06-many-storage')

const scale = 1
const selection = getEnv('BENCHMARK', 'all')

async function main() {
  const benchmarks = {
    'eth-transfers':   async () => runBenchmark('01 |   eth-transfers', run01, scale * 40),
    'erc20-transfers': async () => runBenchmark('02 | erc20-transfers', run02, scale * 25),
    'erc20-deploys':   async () => runBenchmark('03 |   erc20-deploys', run03, scale * 10),
    'erc20-calls':     async () => runBenchmark('04 |     erc20-calls', run04, scale * 120),
    'erc20-storage':   async () => runBenchmark('05 |   erc20-storage', run05, scale * 30),
    'many-storage':    async () => runBenchmark('06 |    many-storage', run06, scale * 1),
  }

  if (selection === 'all') {
    for (const name in benchmarks) {
      await benchmarks[name]()
    }
  } else {
    await benchmarks[selection]();
  }
}

main()
