const { std: libStd } = require('mathjs')

function average(sampleTimes) {
  const totalTime = sampleTimes.reduce((sum, current) => sum + current, BigInt(0))
  return totalTime / BigInt(sampleTimes.length)
}

function std(sampleTimes) {
  const msTimes = sampleTimes
    .map((ns) => ns / BigInt(Math.pow(10, 6)))
    .map((bigint) => Number(bigint))

  return libStd(msTimes, 'uncorrected')
}

module.exports = {
  average,
  std
}
