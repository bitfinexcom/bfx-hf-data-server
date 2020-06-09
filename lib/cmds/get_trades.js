'use strict'

const send = require('../wss/send')

/**
 * @private
 *
 * @param {HFDataServer} ds - server
 * @param {ws.WebSocket} ws - client
 * @param {Array} msg - incoming message
 * @returns {Promise} p
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
