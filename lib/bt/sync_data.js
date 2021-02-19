'use strict'

const debug = require('debug')('bfx:hf:data-server:bt:sync-data')
const send = require('../wss/send')

module.exports = async (db, ws, btArgs) => {
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
