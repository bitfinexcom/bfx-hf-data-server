'use strict'

const { BFXTrade } = require('bfx-hf-db')
const send = require('../send')

module.exports = async (dsState, ws, msg) => {
  // NOTE: 'type' is currently unused, but will be used to differentiate between
  //        funding & normal trades
  const [, symbol, type, from, to] = msg

  return BFXTrade
    .query()
    .select('*')
    .where(b => b
      .where('symbol', symbol)
      .andWhere('mts', '>=', from)
      .andWhere('mts', '<=', to)
    )
    .then(trades => {
      send(ws, ['data.trades', symbol, from, to, trades])

      return trades
    })
}
