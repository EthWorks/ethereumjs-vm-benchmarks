const { getFreshProvider } = require("./provider")
const { average, std } = require("./utils/metrics")
const { formatNanos, formatMs } = require("./utils/formatTime")
const { fillProviderState } = require("./utils/state")
const { getEnv } = require("./utils/getEnv")
const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')
const { run: run03 } = require('./03-erc20-deploys')
const { run: run04 } = require('./04-erc20-calls')
const { run: run05 } = require('./05-erc20-storage')
const { run: run06 } = require('./06-many-storage')

const scale = 1
const samples = 1
const logSampleTimes = getEnv('LOG_SAMPLE_TIMES', false)
const initialState = getEnv('INITIAL_STATE', 'empty')

function log(name, runs, msg) {
  console.log(`${name} | samples: ${samples}, runs: ${runs} | ${msg}`);
}

async function benchmark(name, fn, runs) {
  runs = Math.ceil(runs)
  let provider = getFreshProvider();

  if (initialState !== 'empty') {
    await fillProviderState(provider, 10)
  }

  const sampleTimes = new Array(samples)

  // warm-up
  await fn(runs, provider)
  await fn(runs, provider)

  for (let i = 0; i < samples; i++) {
    sampleTimes[i] = await fn(runs, provider)
    if (logSampleTimes) {
      log(name, runs, `#${i + 1} sample time: ${formatNanos(sampleTimes[i])}`)
    }
  }

  const avgTime = average(sampleTimes)
  const timesStd = std(sampleTimes)

  log(name, runs, `average time: ${formatNanos(avgTime)}, std: ${formatMs(timesStd)}`)
}

async function main() {
  await benchmark('01 |   eth-transfers', run01, scale * 40)
  await benchmark('02 | erc20-transfers', run02, scale * 25)
  await benchmark('03 |   erc20-deploys', run03, scale * 10)
  await benchmark('04 |     erc20-calls', run04, scale * 120)
  await benchmark('05 |   erc20-storage', run05, scale * 30)
  await benchmark('06 |    many-storage', run06, scale * 1)
}

main()
