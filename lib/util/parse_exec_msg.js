'use strict'

module.exports = (msg = []) => {
  const [
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync = true, meta
  ] = msg[1] || []

  return {
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync, meta
  }
}
