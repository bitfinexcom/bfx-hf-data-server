'use strict'

const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  // NOTE: 'type' is currently unused, but will be used to differentiate between
  //        funding & normal trades
  const [, symbol, type, from, to] = msg
  const { db } = ds
  const { Trade } = db

  const trades = await Trade.find(({ symbol: tSym, mts }) => (
    tSym === symbol && (
      mts >= from && mts <= to
    )
  ))

  send(ws, ['data.trades', symbol, from, to, trades])

  return trades
}
