/**
 * Returns **fun** execution time in nanoseconds
 * @param fun function to measure
 */
export async function measureExecution(fun: () => Promise<void> | void): Promise<bigint> {
  const timerStart = process.hrtime.bigint()
  await fun()
  const timerEnd = process.hrtime.bigint()
  return timerEnd - timerStart
}
