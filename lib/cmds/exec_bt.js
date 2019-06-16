'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')
const { rangeString } = require('bfx-hf-util')

const validateBTArgs = require('../util/validate_bt_args')
const parseExecMsg = require('../util/parse_exec_msg')
const sendError = require('../wss/send_error')
const syncBTData = require('../bt/sync_data')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const { rest, db } = ds
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const { Candle, Trade } = db
  const btArgs = parseExecMsg(msg)
  const {
    exchange, sync, symbol, tf, includeTrades, includeCandles, start, end
  } = btArgs

  if (sync) {
    await syncBTData(db, ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(start, end)
  )

  const candleData = await Candle.getInRange([
    ['exchange', '=', exchange],
    ['symbol', '=', symbol],
    ['tf', '=', tf],
  ], {
    key: 'mts',
    start,
    end,
  }, {
    orderBy: 'mts',
    orderDirection: 'asc',
  })

  debug('loaded %d candles', candleData.length)
  debug('streaming data...')

  let sentTrades = 0
  let sentCandles = 0

  // 0 is trades.length TODO: Refactor
  send(ws, ['bt.start', '', '', start, end, , 0, candleData.length])

  if (!includeTrades) {
    candleData.forEach(c => {
      send(ws, ['bt.candle', '', '', c])
      sentCandles++
    })

    send(ws, ['bt.end', '', '', start, end])
    debug('stream complete [%d candles]', sentCandles)
    return // NOTE: hard return
  }

  // TODO: Refactor for performance (profile!) [check legacy version]
  const trades = await Trade.getInRange([
    ['exchange', '=', exchange],
    ['symbol', '=', symbol],
  ], {
    key: 'mts',
    start,
    end,
  }, {
    orderBy: 'mts',
    orderDirection: 'asc',
  })

  trades.sort((a, b) => a.mts - b.mts)
  debug('loaded %d trades', trades.length)

  let trade
  let candleI = 0

  for (let i = 0; i < trades.length; i += 1) {
    trade = trades[i]

    if (includeCandles) {
      while (
        (candleI < candleData.length) &&
        (candleData[candleI].mts < trade.mts)
      ) {
        send(ws, ['bt.candle', '', '', candleData[candleI]])
        candleI++
        sentCandles++
      }
    }

    send(ws, ['bt.trade', '', trade])
    sentTrades++
  }

  send(ws, ['bt.end', '', '', start, end])
  debug('stream complete [%d candles, %d trades]', sentCandles, sentTrades)
}
