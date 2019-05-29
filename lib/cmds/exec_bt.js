'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')
const { rangeString } = require('bfx-hf-util')

const validateBTArgs = require('../util/validate_bt_args')
const parseExecMsg = require('../util/parse_exec_msg')
const sendError = require('../wss/send_error')
const syncBTData = require('../bt/sync_data')
const ERRORS = require('../errors')
const send = require('../wss/send')
const db = require('../db')

const { Candle, Trade } = db
const { getInRange: getCandlesInRange } = Candle
const { find: findTrades } = Trade

module.exports = async (ds, ws, msg) => {
  const { rest } = ds
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const btArgs = parseExecMsg(msg)
  const {
    sync, symbol, tf, includeTrades, includeCandles, start, end
  } = btArgs

  if (sync) {
    await syncBTData(ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(start, end)
  )

  const candleData = getCandlesInRange({
    type: 'hist',
    symbol,
    tf,
  }, { start, end })

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
    return // NOTE: hard return
  }

  // TODO: Refactor for performance (profile!) [check legacy version]
  const trades = findTrades(trade => (
    trade.symbol === symbol && (
      trade.start >= start && trade.end <= end
    )
  ))

  trades.sort((a, b) => a.mts - b.mts)

  let trade
  for (let i = 0; i < trades.length; i += 1) {
    trade = trades[i]

    if (includeCandles) {
      while (
        (candleI < candleData.length) &&
        (candleData[candleI].mts < trade.mts)
      ) {
        send(ws, ['bt.candle', '', '', candleData[candleI]])
        candleI++
      }
    }

    send(ws, ['bt.trade', '', trade])
  }

  send(ws, ['bt.end', '', '', start, end])
  debug('stream complete')
}
