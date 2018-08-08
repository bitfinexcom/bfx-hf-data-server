'use strict'

module.exports = (msg = []) => {
  const [
    from, to, symbol, tf, includeTrades, candleFields, tradeFields,
    sync = true
  ] = msg[1] || []

  return {
    from, to, symbol, tf, tradeFields, candleFields, includeTrades, sync
  }
}
