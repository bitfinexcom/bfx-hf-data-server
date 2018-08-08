'use strict'

const debug = require('debug')('hf:data-server:db:log_info')
const { BFXTrade, BFXCandle } = require('./models')

module.exports = async () => {
  const tradesInfo = await BFXTrade.getInfo()
  const candlesInfo = await BFXCandle.getInfo()

  debug('DB has %d trades, %d candles (totals)', tradesInfo.ct, candlesInfo.ct)
}
