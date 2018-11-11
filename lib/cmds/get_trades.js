'use strict'

const { Trade } = require('bfx-hf-models')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  // NOTE: 'type' is currently unused, but will be used to differentiate between
  //        funding & normal trades
  const [, symbol, type, from, to] = msg

  const trades = await Trade
    .find({
      symbol,
      mts: {
        $gte: from,
        $lte: to,
      }
    })

  send(ws, ['data.trades', symbol, from, to, trades])

  return trades
}
