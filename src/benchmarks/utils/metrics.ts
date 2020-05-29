import { std as libStd } from 'mathjs'

export function average(sampleTimes: bigint[]) {
  const totalTime = sampleTimes.reduce((sum, current) => sum + current, BigInt(0))
  return totalTime / BigInt(sampleTimes.length)
}

export function std(sampleTimes: bigint[]) {
  const msTimes = sampleTimes
    .map((ns) => ns / BigInt(Math.pow(10, 6)))
    .map((bigint) => Number(bigint))

  return libStd(msTimes, 'uncorrected')
}
