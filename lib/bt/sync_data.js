'use strict'

const debug = require('debug')('bfx:hf:data-server:bt:sync-data')
const send = require('../wss/send')

/**
 * @memberof module:bfx-hf-data-server
 * @private
 *
 * @param {module:bfx-hf-models.HFDB} db - database instance
 * @param {WebSocket} ws - client
 * @param {module:bfx-api-node-rest.RESTv2} rest - rest client
 * @param {module:bfx-hf-data-server.BacktestParameters} btArgs - bt args
 */
const syncData = async (db, ws, rest, btArgs) => {
  const {
    exchange, symbol, tf, start, end, includeTrades, includeCandles
  } = btArgs

  const { Trade, Candle } = db

  debug('syncing data...')
  send(ws, ['data.sync.start', symbol, tf, start, end])

  if (includeCandles) {
    await Candle.syncRange({ exchange, symbol, tf }, { start, end })
  }

  if (includeTrades) {
    await Trade.syncRange({ exchange, symbol }, { start, end })
  }

  send(ws, ['data.sync.end', symbol, tf, start, end])
  debug('sync ended')
}

module.exports = syncData
