'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString } = require('bfx-hf-util')
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
const {
  fetchCandles: fetchCandlesFactory,
  fetchTrades: fetchTradesFactory
} = require('../bt/fetch_data')
const ExecutionContext = require('../bt/context')
const RequestSemaphore = require('../bt/request_semaphore')
const seedCandlesFactory = require('../bt/seed_candles')
const generateResults = require('bfx-hf-strategy/lib/util/generate_strategy_results')
const parseStrategy = require('bfx-hf-strategy/lib/util/parse_strategy')
const btDao = require('../db/bt_dao')
const getDerivativesConfig = require('../util/get_derivatives_config')

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
    exchange, strategyId, start, end, symbol, timeframe, includeCandles, includeTrades, candleSeed, sync = true, margin, strategyContent, executionId, constraints = {}, leverageSettings = {}, stopOrderSettings = {}
  ] = msg[1] || []
  const { capitalAllocation, stopLossPerc, maxDrawdownPerc } = constraints
  const { useMaxLeverage, increaseLeverage, leverage } = leverageSettings
  const { addStopOrder, stopOrderPercent } = stopOrderSettings

  let strategy
  try {
    strategy = parseStrategy(strategyContent)
  } catch (e) {
    console.log(e)
    return send(ws, ['bt.btresult', { error: 'Strategy could not get parsed - parse error' }, executionId])
  }

  const priceFeed = new PriceFeed()
  const perfManager = new PerformanceManager(priceFeed, { allocation: capitalAllocation })

  try {
    const indicators = strategy.defineIndicators
      ? strategy.defineIndicators(Indicators)
      : {}

    strategy = HFS.define({
      ...strategy,
      tf: timeframe,
      symbol,
      indicators,
      priceFeed,
      perfManager
    })
  } catch (e) {
    return send(ws, ['bt.btresult', { error: 'Strategy is invalid' }, executionId])
  }

  const context = new ExecutionContext()
  const dataPointFeed = new DataPointFeed()
  const rest = new RESTv2({ transform: true })
  const requestSemaphore = new RequestSemaphore()
  let fetchCandles, seedCandles

  debug(
    'running backtest for %s:%s [%s]',
    symbol, timeframe, rangeString(start, end)
  )

  if (includeCandles) {
    fetchCandles = fetchCandlesFactory(rest, requestSemaphore, { symbol, timeframe })
    const stream = new DataPointStream(fetchCandles)
    dataPointFeed.addStream(stream)
  }

  if (includeTrades) {
    const fetchStrategy = fetchTradesFactory(rest, requestSemaphore, { symbol })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
  }

  if (includeCandles && candleSeed) {
    seedCandles = seedCandlesFactory({
      symbol,
      timeframe,
      fetchCandles,
      start,
      candleSeed
    })
  }

  ds.activeBacktests.set(strategy.gid, context)

  let executionError
  const reportError = (err) => {
    console.error(err)
    executionError = err.message
    sendError(ws, { code: 600, res: err.message })
  }

  let count = 0
  let progressSent = 0
  const reportProgress = (mts) => {
    count++

    if (includeCandles || (count % 50) === 0) {
      const progress = Math.round((mts - start) / (end - start) * 100)
      if (progress > progressSent) {
        progressSent = progress
        send(ws, ['bt.progress', progress, executionId])
      }
    }
  }

  // returns null if not derivatives symbol
  const symbolConfig = await getDerivativesConfig(symbol)
  const isDerivative = !!symbolConfig
  const maxLeverage = symbolConfig ? symbolConfig.maxLeverage : 0

  const args = {
    start,
    end,
    includeTrades,
    includeCandles,
    candleSeed,
    seedCandles,
    priceFeed,
    perfManager,
    startPerformanceWatchers,
    constraints: {
      maxDrawdown: maxDrawdownPerc,
      percStopLoss: stopLossPerc
    },
    context,
    dataPointFeed,
    reportError,
    reportProgress,
    margin,
    isDerivative,
    maxLeverage,
    useMaxLeverage,
    increaseLeverage,
    leverage,
    addStopOrder,
    stopOrderPercent
  }

  send(ws, ['bt.started', strategy.gid])

  return execOffline(strategy, args)
    .then(async (btState = {}) => {
      // check if error received during execution
      if (executionError) {
        send(ws, ['bt.btresult', { error: executionError }, executionId])
        return
      }

      const { nCandles, nTrades, strategy = {} } = btState
      const res = generateResults(perfManager, {
        ...strategy,
        nCandles,
        nTrades
      })

      send(ws, ['bt.btresult', res, executionId])

      // save to bt history db
      const savedBt = await btDao.saveBt(msg[1], res)
      send(ws, ['data.bt.saved', executionId, savedBt])
    })
    .catch(reportError)
    .finally(() => {
      send(ws, ['bt.stopped', strategy.gid])
      ds.activeBacktests.delete(strategy.gid)
      context.close()
      priceFeed.close()
      perfManager.close()
    })
}
