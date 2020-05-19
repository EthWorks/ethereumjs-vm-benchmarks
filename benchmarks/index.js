const { average, std } = require("./utils/metrics")
const { formatNanos, formatMs } = require("./utils/formatTime")
const { run: run01 } = require('./01-eth-transfers')
const { run: run02 } = require('./02-erc20-transfers')
const { run: run03 } = require('./03-erc20-deploys')
const { run: run04 } = require('./04-erc20-calls')
const { run: run05 } = require('./05-erc20-storage')
const { run: run06 } = require('./06-many-storage')

const samples = 10
const scale = 0.01
const logSampleTimes = true

function log(name, runs, msg) {
  console.log(`${name} | samples: ${samples}, runs: ${runs} | ${msg}`);
}

async function benchmark(name, fn, runsFrac) {
  const runs = Math.ceil(runsFrac)
  const sampleTimes = new Array(samples)

  // warm-up
  await fn(runs)
  await fn(runs)

  for (let i = 0; i < samples; i++) {
    sampleTimes[i] = await fn(runs)
    if (logSampleTimes) {
      log(name, runs, `#${i + 1} sample time: ${formatNanos(sampleTimes[i])}`)
    }
  }

  const avgTime = average(sampleTimes)
  const timesStd = std(sampleTimes)

  log(name, runs, `average time: ${formatNanos(avgTime)}, std: ${formatMs(timesStd)}`)
}

async function main() {
  await benchmark('01 |   eth-transfers', run01, scale * 300)
  await benchmark('02 | erc20-transfers', run02, scale * 200)
  await benchmark('03 |   erc20-deploys', run03, scale * 125)
  await benchmark('04 |     erc20-calls', run04, scale * 1200)
  await benchmark('05 |   erc20-storage', run05, scale * 220)
  await benchmark('06 |    many-storage', run06, scale * 12)
}

main()
