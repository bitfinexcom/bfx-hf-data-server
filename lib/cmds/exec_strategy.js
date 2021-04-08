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

const validateBTArgs = require('../util/validate_bt_args')
const sendError = require('../wss/send_error')
const syncBTData = require('../bt/sync_data')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const { db } = ds
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

  try {
    strategy = HFS.define({
      ...strategy,

      tf,
      symbol,
      indicators: {
        ...strategy.defineIndicators(Indicators)
      }
    })
  } catch (e) {
    return send(ws, ['bt.btresult', { error: 'Strategy is invalid' }, meta])
  }

  const { Candle, Trade } = db

  if (sync) {
    const btArgs = {
      exchange, sync, symbol, tf, includeTrades, includeCandles, start, end, meta
    }

    await syncBTData(db, ws, btArgs)
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

function generateResults (btState = {}) {
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
