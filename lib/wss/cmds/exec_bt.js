'use strict'

const { BFXCandle, BFXTrade } = require('../../db/models')

const syncBTData = require('../../bt/sync_data')
const streamBTData = require('../../bt/stream_data')
const validateBTArgs = require('../../util/validate_bt_args')
const parseExecMsg = require('../../util/parse_exec_msg')

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
