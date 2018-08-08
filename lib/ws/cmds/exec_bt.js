'use strict'

const { BFXCandle, BFXTrade } = require('bfx-hf-db')
const {
  syncData: syncBTData,
  streamData: streamBTData,
  validateBTArgs,
  parseExecMsg,
} = require('bfx-hf-db')

const sendError = require('../send_error')

module.exports = async (dsState, ws, msg) => {
  const { rest } = dsState
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const btArgs = parseExecMsg(msg)
  const { sync, symbol, tf, includeTrades, from, to } = btArgs

  if (sync) {
    await syncBTData(ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s (trades %s) [%s]',
    symbol, tf, includeTrades, rangeString(from, to)
  )

  debug(`loading ${includeTrades ? 'trades & candles' : 'candles'}`)

  const candles = await BFXCandle.queryRange(args)
  const trades = !includeTrades
    ? []
    : await BFXTrade.queryRange(args)

  debug('loaded %d candles', candles.length)
  if (includeTrades) debug('loaded %d trades', trades.length)

  debug('streaming data...')

  await streamBTData(ws, trades, candles)

  debug('backtest complete')
}
