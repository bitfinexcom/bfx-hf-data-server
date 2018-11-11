'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')
const { rangeString } = require('bfx-hf-util')
const { Candle, Trade } = require('bfx-hf-models')

const syncBTData = require('../bt/sync_data')
const validateBTArgs = require('../util/validate_bt_args')
const parseExecMsg = require('../util/parse_exec_msg')
const send = require('../wss/send')
const sendError = require('../wss/send_error')

module.exports = async (ds, ws, msg) => {
  const { rest } = ds
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const btArgs = parseExecMsg(msg)
  const { sync, symbol, tf, includeTrades, includeCandles, start, end } = btArgs

  if (!includeTrades && !includeCandles) {
    debug('requested empty backtest (no trades or candles), refusing')
    return
  }

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

  if (!includeTrades) {
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

      if (includeCandles) {
        while (candleI < candleData.length && candleData[candleI].mts < mts) {
          send(ws, ['bt.candle', '', '', candleData[candleI]])
          candleI++
        }
      }

      send(ws, ['bt.trade', '', trade])
    })

    tradeStream.on('close', () => {
      send(ws, ['bt.end', '', '', start, end])
      debug('stream complete')
    })
  }
}
