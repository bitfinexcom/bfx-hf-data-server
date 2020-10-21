'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString } = require('bfx-hf-util')

const { execOffline } = require('bfx-hf-backtest')
const HFS = require('bfx-hf-strategy')
const Indicators = require('bfx-hf-indicators')

const validateBTArgs = require('../util/validate_bt_args')
const sendError = require('../wss/send_error')
const syncBTData = require('../bt/sync_data')
const send = require('../wss/send')
const generateResults = require('../util/generate_results')
const parseStrategy = require('../util/parse_strategy')

module.exports = async (ds, ws, msg) => {
  const { rest, db } = ds
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const [
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync = true, strategyContent, meta
  ] = msg[1] || []

  let strategy
  try {
    strategy = parseStrategy(strategyContent)
  } catch (e) {
    console.log(e)
    return send(ws, ['bt.btresult', { error: 'Strategy could not get parsed - parse error' }, meta])
  }

  strategy = HFS.define({
    ...strategy,

    tf,
    symbol,
    indicators: {
      ...strategy.defineIndicators(Indicators)
    }
  })

  const { Candle, Trade } = db

  if (sync) {
    const btArgs = {
      exchange, sync, symbol, tf, includeTrades, includeCandles, start, end, meta
    }

    await syncBTData(db, ws, rest, btArgs)
  }

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(start, end)
  )

  let candleData = []
  if (includeCandles) {
    candleData = await Candle.getInRange([
      ['exchange', '=', exchange],
      ['symbol', '=', symbol],
      ['tf', '=', tf]
    ], {
      key: 'mts',
      start,
      end
    }, {
      orderBy: 'mts',
      orderDirection: 'asc'
    })

    debug('loaded %d candles', candleData.length)
  }

  let tradeData = []
  if (includeTrades) {
    tradeData = await Trade.getInRange([
      ['exchange', '=', exchange],
      ['symbol', '=', symbol]
    ], {
      key: 'mts',
      start,
      end
    }, {
      orderBy: 'mts',
      orderDirection: 'asc'
    })

    debug('loaded %d trades', tradeData.length)
  }

  execOffline(strategy, {
    candles: candleData,
    trades: tradeData
  }, (currentTick, totalTicks) => {
    if (currentTick % 10 === 0) send(ws, ['bt.progress', currentTick, totalTicks, meta])
    if (currentTick === totalTicks) send(ws, ['bt.progress', currentTick, totalTicks, meta])
  }).then((btState = {}) => {
    const { nCandles, nTrades } = btState
    const { trades = [] } = btState.strategy || {}
    const data = {
      strategy: { trades },
      nCandles,
      nTrades,
      finished: true,
      candles: candleData
    }

    const res = generateResults(data)

    send(ws, ['bt.btresult', { ...data, ...res }, meta])
  })
}
