const prettyTime = require('pretty-time')

/**
 * Get pretty string representation of nanoseconds
 * @param nanoseconds BigInt timestamp
 */
function formatNanos(nanoseconds) {
  const seconds = nanoseconds / BigInt(Math.pow(10, 9))
  const remainingNs = nanoseconds - seconds * BigInt(Math.pow(10, 9))
  return prettyTime([Number(seconds), Number(remainingNs)], 'ms')
}

function formatMs(milliseconds) {
  const seconds = milliseconds / Math.pow(10, 3)
  const remainingMs = milliseconds - seconds * Math.pow(10, 3)
  const remainingNs = remainingMs * Math.pow(10, 6)
  return prettyTime([seconds, remainingNs], 'ms', 2)
}

module.exports = {
  formatNanos,
  formatMs
}
