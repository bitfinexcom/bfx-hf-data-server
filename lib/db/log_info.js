'use strict'

const debug = require('debug')('bfx:hf:data-server:db:log_info')
const { Trade, Candle } = require('bfx-hf-models')

module.exports = async () => {
  const nTrades = await Trade.estimatedDocumentCount()
  const nCandles = await Candle.estimatedDocumentCount()

  debug('DB has %d trades, %d candles (totals)', nTrades, nCandles)
}
