'use strict'

const _isEmpty = require('lodash/isEmpty')
const send = require('../wss/send')

module.exports = (ws, trades = [], candles = []) => {
  send(ws, ['bt.start', symbol, tf, from, to, trades.length, candles.lenth])

  if (_isEmpty(trades)) { // no trades, send only candles
    candles.forEach(c => {
      send(ws, ['bt.candle', symbol, tf, c])
    })
  } else if (_isEmpty(candles)) { // no candles, send only trades
    trades.forEach(t => {
      send(ws, ['bt.trade', symbol, t])
    })
  } else { // mixed response
    let tradeI = 0

    // go through candles, advancing through trades as needed
    candles.forEach(c => {
      while (tradeI < trades.length && trades[tradeI].mts < c.mts) {
        send(ws, ['bt.trade', symbol, trades[tradeI]])
        tradeI++
      }

      send(ws, ['bt.candle', symbol, tf, c])
    })
  }

  send(ws, ['bt.end', symbol, tf, from, to])
}
