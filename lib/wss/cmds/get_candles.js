'use strict'

const { Candle } = require('bfx-hf-models')
const send = require('../send')

const getCandles = async (dsState, ws, msg) => {
  const { rest } = dsState
  const [, symbol, tf, type, start, end] = msg

  // Ensure chunks are available
  await Candle.syncRange(rest, {
    symbol,
    tf,
    start,
    end,
  })

  const candles = await Candle
    .find({
      symbol,
      tf,
      type,
      mts: {
        $gte: start,
        $lte: end,
      }
    }).exec()

  send(ws, ['data.candles', symbol, tf, type, start, end, candles])

  return candles
}

module.exports = getCandles
