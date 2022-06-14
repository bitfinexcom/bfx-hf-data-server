'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString, candleWidth } = require('bfx-hf-util')
const { execOffline } = require('bfx-hf-backtest')
const HFS = require('bfx-hf-strategy')
const Indicators = require('bfx-hf-indicators')
const { PriceFeed, PerformanceManager, StartWatchers: startPerformanceWatchers } = require('bfx-hf-strategy-perf')
const { RESTv2 } = require('bfx-api-node-rest')

const validateBTArgs = require('../util/validate_bt_args')
const sendError = require('../wss/send_error')
const send = require('../wss/send')
const DataPointFeed = require('../bt/data_feed')
const DataPointStream = require('../bt/data_stream')
const { fetchCandles, fetchTrades } = require('../bt/fetch_data')
const ExecutionContext = require('../bt/context')
const RequestSemaphore = require('../bt/request_semaphore')
const generateResults = require('bfx-hf-strategy/lib/util/generate_strategy_results')
const parseStrategy = require('bfx-hf-strategy/lib/util/parse_strategy')
const { onSeedCandle } = require('bfx-hf-strategy')

/**
 * @param {DataServer} ds
 * @param {WebSocket} ws
 * @param {Array} msg
 * @return {Promise<void>}
 */
module.exports = async (ds, ws, msg) => {
  const err = validateBTArgs(msg)

  if (err !== null) {
    return sendError(ws, err)
  }

  const [
    // eslint-disable-next-line no-unused-vars
    exchange, start, end, symbol, timeframe, includeCandles, includeTrades, candleSeed, sync = true, strategyContent, meta, constraints = {}
  ] = msg[1] || []
  const { capitalAllocation, stopLossPerc, maxDrawdownPerc } = constraints

  let strategy
  try {
    strategy = parseStrategy(strategyContent)
  } catch (e) {
    console.log(e)
    return send(ws, ['bt.btresult', { error: 'Strategy could not get parsed - parse error' }, meta])
  }

  const priceFeed = new PriceFeed()
  const perfManager = new PerformanceManager(priceFeed, { allocation: capitalAllocation })

  try {
    strategy = HFS.define({
      ...strategy,
      tf: timeframe,
      symbol,
      indicators: {
        ...strategy.defineIndicators(Indicators)
      },
      priceFeed,
      perfManager
    })
  } catch (e) {
    return send(ws, ['bt.btresult', { error: 'Strategy is invalid' }, meta])
  }

  const context = new ExecutionContext()
  const dataPointFeed = new DataPointFeed()
  const rest = new RESTv2({ transform: true })
  const requestSemaphore = new RequestSemaphore()

  debug(
    'running backtest for %s:%s [%s]',
    symbol, timeframe, rangeString(start, end)
  )

  if (includeCandles) {
    const fetchStrategy = fetchCandles(rest, requestSemaphore, { symbol, timeframe })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
  }

  if (includeTrades) {
    const fetchStrategy = fetchTrades(rest, requestSemaphore, { symbol })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
  }

  if (candleSeed) {
    const cWidth = candleWidth(timeframe)
    const seedStart = start - (candleSeed * cWidth)
    const candles = await rest.candles({
      timeframe,
      symbol,
      query: {
        limit: candleSeed,
        start: seedStart,
        end: start,
        sort: 1
      }
    })

    for (const candle of candles) {
      candle.tf = timeframe
      candle.symbol = symbol

      strategy = onSeedCandle(strategy, candle)
    }
  }

  ds.activeBacktests.set(strategy.gid, context)

  const args = {
    start,
    end,
    includeTrades,
    includeCandles,
    priceFeed,
    perfManager,
    startPerformanceWatchers,
    constraints: {
      maxDrawdown: maxDrawdownPerc,
      percStopLoss: stopLossPerc
    },
    context,
    dataPointFeed
  }

  send(ws, ['bt.started', strategy.gid])

  return execOffline(strategy, args)
    .then((btState = {}) => {
      const res = generateResults(perfManager, btState)

      send(ws, ['bt.btresult', res, meta])
    })
    .catch((err) => {
      console.error(err)
      sendError(ws, { code: 600, res: err.message })
    })
    .finally(() => {
      send(ws, ['bt.stopped', strategy.gid])
      ds.activeBacktests.delete(strategy.gid)
      context.close()
      priceFeed.close()
      perfManager.close()
    })
}
