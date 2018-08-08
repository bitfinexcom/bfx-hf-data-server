'use strict'

// const debug = require('debug')('hf:server:data:ws:cmds:get_candles')
const { BFXCandle } = require('../../db/models')
const send = require('../send')

const getCandles = async (dsState, ws, msg) => {
  const { rest } = dsState
  const [, symbol, tf, type, from, to] = msg

  // Ensure chunks are available
  await BFXCandle.syncRemoteRange(rest, {
    symbol,
    tf,
    from,
    to,
  }, (curr, total) => {
    if (curr === 0) {
      send(ws, ['data.sync.start', symbol, tf, type, from, to, total])
    } else if (curr === total) {
      send(ws, ['data.sync.end', symbol, tf, type, from, to, total])
    } else {
      send(ws, ['data.sync.tick', symbol, tf, type, from, to, total, curr])
    }
  })

  const candles = await BFXCandle
    .query()
    .select('*')
    .where(b => b
      .where('symbol', symbol)
      .andWhere('tf', tf)
      .andWhere('type', type)
      .andWhere('mts', '>=', from)
      .andWhere('mts', '<=', to)
    )

  send(ws, ['data.candles', symbol, tf, type, from, to, candles])

  return candles
}

module.exports = getCandles
