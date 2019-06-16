'use strict'

const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  // NOTE: 'type' is currently unused, but will be used to differentiate between
  //        funding & normal trades
  const [, symbol, type, from, to] = msg
  const { db } = ds
  const { Trade } = db

  const trades = await Trade.getInRange([['symbol', '=', symbol]], {
    key: 'mts',
    start: from,
    end: to,
  })

  send(ws, ['data.trades', symbol, from, to, trades])

  return trades
}
