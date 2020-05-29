/* eslint-disable key-spacing */
import { getEnv } from './utils/getEnv'
import { runBenchmark } from './benchmark'
import { run as run01 } from './01-eth-transfers'
import { run as run02 } from './02-erc20-transfers'
import { run as run03 } from './03-erc20-deploys'
import { run as run04 } from './04-erc20-calls'
import { run as run05 } from './05-erc20-storage'
import { run as run06 } from './06-many-storage'

const scale = 1
const selection = getEnv('BENCHMARK', 'all')

async function main () {
  const benchmarks: any = {
    'eth-transfers':   () => runBenchmark('01 |   eth-transfers', run01, scale * 40),
    'erc20-transfers': () => runBenchmark('02 | erc20-transfers', run02, scale * 25),
    'erc20-deploys':   () => runBenchmark('03 |   erc20-deploys', run03, scale * 10),
    'erc20-calls':     () => runBenchmark('04 |     erc20-calls', run04, scale * 120),
    'erc20-storage':   () => runBenchmark('05 |   erc20-storage', run05, scale * 30),
    'many-storage':    () => runBenchmark('06 |    many-storage', run06, scale * 1),
  }

  if (selection === 'all') {
    for (const name in benchmarks) {
      await benchmarks[name]()
    }
  } else {
    await benchmarks[selection]()
  }
}

main()
