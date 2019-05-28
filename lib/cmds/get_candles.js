'use strict'

const db = require('../db')
const send = require('../wss/send')

const { Candle } = db

module.exports = async (ds, ws, msg) => {
  const { rest } = ds
  const [, symbol, tf, type, start, end] = msg

  // Ensure chunks are available
  send(ws, ['data.sync.start', symbol, tf, start, end])

  await Candle.syncRange(rest, {
    symbol,
    tf,
    start,
    end,
  })

  send(ws, ['data.sync.end', symbol, tf, start, end])

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
