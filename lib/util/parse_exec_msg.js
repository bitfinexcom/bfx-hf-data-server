'use strict'

module.exports = (msg = []) => {
  const [
    from, to, symbol, tf, candles, trades, candleFields, tradeFields,
    sync = true
  ] = msg[1] || []

  return {
    from, to, symbol, tf, tradeFields, candleFields, candles, trades, sync
  }
}
