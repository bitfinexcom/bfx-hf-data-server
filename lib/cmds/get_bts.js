'use strict'

const send = require('../wss/send')

/**
 * @memberof module:bfx-hf-data-server
 * @private
 * @async
 *
 * @param {module:bfx-hf-data-server.Server} ds - server
 * @param {WebSocket} ws - client
 */
const getBTs = async (ds, ws) => {
  const { db } = ds
  const { Backtest } = db

  const bts = await Backtest.getAll()

  send(ws, ['data.bts', bts])
}

module.exports = getBTs
