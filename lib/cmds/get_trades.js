'use strict'

const send = require('../wss/send')

/**
 * @memberof module:bfx-hf-data-server
 * @private
 * @async
 *
 * @param {module:bfx-hf-data-server.Server} ds - server
 * @param {WebSocket} ws - client
 * @param {Array} msg - incoming message
 */
const getTrades = async (ds, ws, msg) => {
  const [, symbol,, from, to] = msg
  const { db } = ds
  const { Trade } = db

  const trades = await Trade.getInRange([['symbol', '=', symbol]], {
    key: 'mts',
    start: from,
    end: to
  })

  send(ws, ['data.trades', symbol, from, to, trades])

  return trades
}

module.exports = getTrades
