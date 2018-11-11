'use strict'

module.exports = (msg = []) => {
  const [
    start, end, symbol, tf, includeCandles, includeTrades, sync = true
  ] = msg[1] || []

  return {
    start, end, symbol, tf, includeCandles, includeTrades, sync
  }
}
