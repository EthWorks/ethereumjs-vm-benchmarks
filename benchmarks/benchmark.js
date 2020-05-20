const { getEnv } = require("./utils/getEnv")
const { getFreshProvider } = require("./provider")
const { average, std } = require("./utils/metrics")
const { formatNanos, formatMs } = require("./utils/formatTime")
const { fillProviderState } = require("./utils/state")

const samples = 10
const logSampleTimes = getEnv('LOG_SAMPLE_TIMES', true)
const initialState = getEnv('INITIAL_STATE', 'empty')

function log(name, runs, msg) {
  console.log(`${name} | samples: ${samples}, runs: ${runs} | ${msg}`);
}

exports.runBenchmark = async function (name, fn, runs) {
  runs = Math.ceil(runs)
  let provider = getFreshProvider()

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
