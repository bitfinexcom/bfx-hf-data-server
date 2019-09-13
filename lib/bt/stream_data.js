'use strict'

const _isEmpty = require('lodash/isEmpty')
const send = require('../wss/send')

module.exports = (ws, start, end, trades = [], candles = []) => {
  send(ws, ['bt.start', '', '', start, end,, trades.length, candles.length]) // eslint-disable-line

  if (_isEmpty(trades)) { // no trades, send only candles
    candles.forEach(c => { send(ws, ['bt.candle', '', '', c]) })
  } else if (_isEmpty(candles)) { // no candles, send only trades
    trades.forEach(t => { send(ws, ['bt.trade', '', t]) })
  } else { // mixed response
    let tradeI = 0

    // go through candles, advancing through trades as needed
    candles.forEach(c => {
      while (tradeI < trades.length && trades[tradeI].mts < c.mts) {
        send(ws, ['bt.trade', '', trades[tradeI]])
        tradeI++
      }

      send(ws, ['bt.candle', '', '', c])
    })
  }

  send(ws, ['bt.end', '', '', start, end])
}
