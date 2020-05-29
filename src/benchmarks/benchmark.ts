import { getBooleanEnv, getEnv } from './utils/getEnv'
import { getFreshProvider } from './provider'
import { average, std } from './utils/metrics'
import { formatMs, formatNanos } from './utils/formatTime'
import { fillProviderState } from './utils/state'
import { SimpleProvider } from '../chain'

const samples = 10
const logSampleTimes = getBooleanEnv('LOG_SAMPLE_TIMES', true)
const initialState = getEnv('INITIAL_STATE', 'empty')

function log (name: string, runs: number, msg: string) {
  console.log(`${name} | samples: ${samples}, runs: ${runs} | ${msg}`)
}

type BenchmarkFunction = (runs: number, provider: SimpleProvider) => Promise<bigint>

export async function runBenchmark (name: string, fn: BenchmarkFunction, runs: number) {
  runs = Math.ceil(runs)
  const provider = await getFreshProvider()

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
