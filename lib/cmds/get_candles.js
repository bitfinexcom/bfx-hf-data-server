'use strict'

const db = require('../db')
const send = require('../wss/send')

const { Candle } = db
const { syncRange, getInRange } = Candle

module.exports = async (ds, ws, msg) => {
  const [, symbol, tf, type, start, end] = msg

  send(ws, ['data.sync.start', symbol, tf, start, end])
  await syncRange({ symbol, tf, type }, { start, end })
  send(ws, ['data.sync.end', symbol, tf, start, end])

  const candles = getInRange({ symbol, tf, type }, { start, end })
  
  send(ws, ['data.candles', symbol, tf, type, start, end, candles])

  return candles
}
