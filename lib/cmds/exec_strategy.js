'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString } = require('bfx-hf-util')
const HFU = require('bfx-hf-util')
const _ = require('lodash')
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
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync = true, strategyContent, meta, constraints = {}
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
      tf,
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
    symbol, tf, rangeString(start, end)
  )

  if (includeCandles) {
    const fetchStrategy = fetchCandles(rest, requestSemaphore, { symbol, tf })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
  }

  if (includeTrades) {
    const fetchStrategy = fetchTrades(rest, requestSemaphore, { symbol })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
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

function parseStrategy (strategyContent) {
  const strategy = {}
  const sections = Object.keys(strategyContent)

  let sectionContent
  let section

  for (let i = 0; i < sections.length; i += 1) {
    section = sections[i]
    sectionContent = strategyContent[section]

    if (section.substring(0, 6) === 'define') {
      strategy[section] = eval(sectionContent) // eslint-disable-line
    } else if (section.substring(0, 2) === 'on') {
      strategy[section] = eval(sectionContent)({ HFS, HFU, _ }) // eslint-disable-line
    }
  }

  return strategy
}
