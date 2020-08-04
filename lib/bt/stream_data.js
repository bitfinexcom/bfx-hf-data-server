'use strict'

const _isEmpty = require('lodash/isEmpty')
const send = require('../wss/send')

/**
 * @private
 *
 * @param {ws.WebSocket} ws - client
 * @param {number} start - start timestamp
 * @param {number} end - end timestamp
 * @param {bfx-api-node-models.PublicTrade[]} [trades=[]] - trades for backtest
 * @param {bfx-api-node-models.Candle[]} [candles=[]] - candles for backtest
 */
const streamData = (ws, start, end, trades = [], candles = []) => {
  send(ws, ['bt.start', '', '', start, end,, trades.length, candles.length]) // eslint-disable-line

  if (_isEmpty(trades)) {
    candles.forEach(c => { send(ws, ['bt.candle', '', '', c]) })
  } else if (_isEmpty(candles)) {
    trades.forEach(t => { send(ws, ['bt.trade', '', t]) })
  } else {
    let tradeI = 0

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

module.exports = streamData
