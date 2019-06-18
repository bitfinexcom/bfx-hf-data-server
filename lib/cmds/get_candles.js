'use strict'

const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, exchange, symbol, tf, type, start, end] = msg
  const { db } = ds
  const { Candle } = db

  send(ws, ['data.sync.start', symbol, tf, start, end])

  await Candle.syncRange({
    exchange,
    symbol,
    tf,
  }, { start, end })

  send(ws, ['data.sync.end', symbol, tf, start, end])

  const candles = await Candle.getInRange([
    ['exchange', '=', exchange],
    ['symbol', '=', symbol],
    ['tf', '=', tf],
  ], {
    key: 'mts',
    start,
    end,
  })
  
  send(ws, ['data.candles', symbol, tf, type, start, end, candles])

  return candles
}
