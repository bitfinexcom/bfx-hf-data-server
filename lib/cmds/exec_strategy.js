'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString } = require('bfx-hf-util')
const HFU = require('bfx-hf-util')
const _ = require('lodash')
const _sum = require('lodash/sum')
const _min = require('lodash/min')
const _max = require('lodash/max')
const { std } = require('mathjs')
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
  const { allocation, maxPositionSize } = constraints

  let strategy
  try {
    strategy = parseStrategy(strategyContent)
  } catch (e) {
    console.log(e)
    return send(ws, ['bt.btresult', { error: 'Strategy could not get parsed - parse error' }, meta])
  }

  const priceFeed = new PriceFeed()
  const perfManager = new PerformanceManager(priceFeed, {
    allocation,
    maxPositionSize
  })

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

  debug(
    'running backtest for %s:%s [%s]',
    symbol, tf, rangeString(start, end)
  )

  if (includeCandles) {
    const fetchStrategy = fetchCandles(rest, { symbol, tf, start, end })
    const stream = new DataPointStream(fetchStrategy)
    dataPointFeed.addStream(stream)
  }

  if (includeTrades) {
    const fetchStrategy = fetchTrades(rest, { symbol })
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
    constraints,
    context,
    dataPointFeed
  }

  execOffline(strategy, args)
    .then((btState = {}) => {
      const { nCandles, nTrades } = btState
      const { trades = [] } = btState.strategy || {}
      const data = {
        strategy: { trades },
        nCandles,
        nTrades,
        finished: true
      }

      const res = generateResults(perfManager, data)

      send(ws, ['bt.btresult', { ...data, ...res }, meta])
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

function generateResults (perfManager, btState = {}) {
  const { strategy = {}, nCandles, nTrades } = btState
  const { trades = [] } = strategy

  const nStrategyTrades = trades.length
  const pls = trades.map(t => t.pl)
  const gains = pls.filter(pl => pl > 0)
  const losses = pls.filter(pl => pl < 0)
  const nOpens = pls.filter(pl => pl === 0).length
  const vol = _sum(trades.map(t => Math.abs(t.price * t.amount)))
  const fees = _sum(trades.map(t => t.fee))
  const totalGain = _sum(gains)
  const totalLoss = _sum(losses)
  const pf = totalGain / Math.abs(totalLoss)
  const pl = _sum(pls)
  const minPL = _min(pls)
  const maxPL = _max(pls)
  const accumulatedPLs = trades.map(x => x.pl)
  const stdDeviation = std(accumulatedPLs.length > 0 ? accumulatedPLs : [0])
  const avgPL = _sum(accumulatedPLs) / accumulatedPLs.length
  const allocation = perfManager.allocation
  const positionSize = perfManager.positionSize()
  const currentAllocation = perfManager.currentAllocation()
  const availableFunds = perfManager.availableFunds
  const equityCurve = perfManager.equityCurve()
  const ret = perfManager.return()
  const retPerc = perfManager.returnPerc()
  const drawdown = perfManager.drawdown()

  return {
    nTrades,
    nCandles,
    pf,
    pl,
    minPL,
    maxPL,
    nStrategyTrades,
    nOpens,
    vol,
    fees,
    stdDeviation,
    avgPL,

    allocation,
    positionSize,
    currentAllocation,
    availableFunds,
    equityCurve,
    return: ret,
    returnPerc: retPerc,
    drawdown,

    nGains: gains.length,
    nLosses: losses.length,
    trades: trades.map(t => ({
      ...t,
      date: new Date(t.mts)
    }))
  }
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
