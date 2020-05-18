/**
 * Returns **fun** execution time in nanoseconds
 * @param fun function to measure
 */
exports.measureExecution = async function (fun) {
  const timerStart = process.hrtime.bigint()
  await fun()
  const timerEnd = process.hrtime.bigint()
  return timerEnd - timerStart
}
