'use strict'

const debug = require('debug')('hf:backtest:wss:cmds:exec-bt')
const { rangeString } = require('bfx-hf-util')

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
  const { sync, symbol, tf, candles, trades, from, to } = btArgs

  if (sync) {
    await syncBTData(ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(from, to)
  )

  let candleData = []
  let tradeData = []

  if (candles) {
    candleData = await BFXCandle.queryRange(btArgs)
    debug('loaded %d candles', candleData.length)
  }

  if (trades) {
    tradeData = await BFXTrade.queryRange(btArgs)
    debug('loaded %d trades', tradeData.length)
  }

  debug('streaming data...')

  await streamBTData(ws, from, to, tradeData, candleData)

  debug('backtest complete')
}
