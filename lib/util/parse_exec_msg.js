'use strict'

module.exports = (msg = []) => {
  const [
    start, end, symbol, tf, candles, trades, candleFields, tradeFields,
    sync = true
  ] = msg[1] || []

  return {
    start, end, symbol, tf, tradeFields, candleFields, candles, trades, sync
  }
}
