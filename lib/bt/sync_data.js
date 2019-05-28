'use strict'

const debug = require('debug')('bfx:hf:data-server:bt:sync-data')
const { Trade, Candle } = require('bfx-hf-models')

const send = require('../wss/send')

module.exports = async (ws, rest, btArgs) => {
  const {
    symbol, tf, start, end, includeTrades, includeCandles
  } = btArgs

  debug('syncing data...')
  send(ws, ['data.sync.start', symbol, tf, start, end])

  if (includeCandles) {
    await Candle.syncRange(rest, btArgs)
  }

  if (includeTrades) {
    await Trade.syncRange(rest, btArgs)
  }

  send(ws, ['data.sync.end', symbol, tf, start, end])
  debug('sync ended')
}
