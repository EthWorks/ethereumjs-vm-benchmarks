const prettyTime = require('pretty-time')
/**
 * Get pretty string representation of nanoseconds
 * @param nanoseconds BigInt timestamp
 */
exports.formatTime = function (nanoseconds) {
  const seconds = nanoseconds / BigInt(Math.pow(10, 9))
  const remainingNs = nanoseconds - seconds * BigInt(Math.pow(10, 9))
  return prettyTime([Number(seconds), Number(remainingNs)], 'ms')
}
