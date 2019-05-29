'use strict'

const db = require('../db')
const send = require('../wss/send')

const { Trade } = db
const { find: findTrades } = Trade

module.exports = async (ds, ws, msg) => {
  // NOTE: 'type' is currently unused, but will be used to differentiate between
  //        funding & normal trades
  const [, symbol, type, from, to] = msg

  const trades = findTrades(({ symbol: tSym, mts }) => (
    tSym === symbol && (
      mts >= from && mts <= to
    )
  ))

  send(ws, ['data.trades', symbol, from, to, trades])

  return trades
}
