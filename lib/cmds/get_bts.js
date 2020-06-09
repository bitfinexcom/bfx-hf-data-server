'use strict'

const send = require('../wss/send')

/**
 * @private
 *
 * @param {HFDataServer} ds - server
 * @param {ws.WebSocket} ws - client
 */
const getBTs = async (ds, ws) => {
  const { db } = ds
  const { Backtest } = db

  const bts = await Backtest.getAll()

  send(ws, ['data.bts', bts])
}

module.exports = getBTs
