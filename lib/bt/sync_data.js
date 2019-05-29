'use strict'

const debug = require('debug')('bfx:hf:data-server:bt:sync-data')
const send = require('../wss/send')
const db = require('../db')

const { Trade, Candle } = db
const { syncRange: syncCandleRange } = Candle
const { syncRange: syncTradeRange } = Trade

module.exports = async (ws, rest, btArgs) => {
  const {
    symbol, tf, start, end, includeTrades, includeCandles
  } = btArgs

  debug('syncing data...')
  send(ws, ['data.sync.start', symbol, tf, start, end])

  if (includeCandles) {
    await syncCandleRange({ symbol, tf, type: 'hist' }, { start, end })
  }

  if (includeTrades) {
    await syncTradeRange({ symbol }, { start, end })
  }

  send(ws, ['data.sync.end', symbol, tf, start, end])
  debug('sync ended')
}
