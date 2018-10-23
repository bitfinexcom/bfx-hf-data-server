'use strict'

const debug = require('debug')('bfx:hf:backtest:wss:cmds:exec-bt')
const { rangeString } = require('bfx-hf-util')

const { Candle, Trade } = require('bfx-hf-models')
const syncBTData = require('../../bt/sync_data')
const streamBTData = require('../../bt/stream_data')
const validateBTArgs = require('../../util/validate_bt_args')
const parseExecMsg = require('../../util/parse_exec_msg')
const send = require('../send')

const sendError = require('../send_error')

module.exports = async (dsState, ws, msg) => {
  const { rest } = dsState
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const btArgs = parseExecMsg(msg)
  const { sync, symbol, tf, trades, start, end } = btArgs

  if (sync) {
    await syncBTData(ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(start, end)
  )

  const candleData = await Candle.queryRange(btArgs)
  debug('loaded %d candles', candleData.length)
  debug('streaming data...')

  // 0 is trades.length TODO: Refactor
  send(ws, ['bt.start', '', '', start, end, , 0, candleData.length])

  if (!trades) {
    candleData.forEach(c => {
      send(ws, ['bt.candle', '', '', c])
    })

    send(ws, ['bt.end', '', '', start, end])
    debug('stream complete')
  } else {
    const tradeStream = Trade
      .find({
        symbol,
        mts: {
          $gte: start,
          $lte: end
        }
      })
      .sort({ mts: 1 })
      .cursor()

    let candleI = 0

    tradeStream.on('data', (trade) => {
      const { mts } = trade

      while (candleI < candleData.length && candleData[candleI].mts < mts) {
        send(ws, ['bt.candle', '', '', candleData[candleI]])
        candleI++
      }

      send(ws, ['bt.trade', '', trade])
    })

    tradeStream.on('close', () => {
      send(ws, ['bt.end', '', '', start, end])
      debug('stream complete')
    })
  }
}
