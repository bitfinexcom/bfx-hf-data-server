'use strict'

const path = require('path')

const debug = require('debug')('bfx:hf:data-server:cmds:exec-bt')

const { rangeString } = require('bfx-hf-util')

const { execStream } = require('bfx-hf-backtest')
const HFS = require('bfx-hf-strategy')
const Indicators = require('bfx-hf-indicators')

const sendError = require('../wss/send_error')
const send = require('../wss/send')
const generateResults = require('../util/generate_results')
const parseStrategy = require('../util/parse_strategy')

const dazaar = require('dazaar')
const swarm = require('dazaar/swarm')
const Hyperbee = require('hyperbee')
const keyEncoding = require('bitfinex-terminal-key-encoding')
const ram = require('random-access-memory')

function getDatabase (buyer) {
  return new Promise((resolve, reject) => {
    let replication = null

    buyer.on('feed', function () {
      const db = new Hyperbee(buyer.feed, {
        keyEncoding,
        valueEncoding: 'json'
      })

      resolve({ db, replication })
    })

    replication = swarm(buyer)
  })
}

function getLegacyCandleFormatter ({ exchange, symbol, tf }) {
  const kprefix = `${exchange}-${symbol}-${tf}`

  return function candleLegacyFormat (data) {
    const [mts, open, close, high, low, volume] = data

    return {
      mts,
      open,
      high,
      low,
      close,
      volume,
      key: `${kprefix}-${mts}`,
      exchange,
      symbol,
      tf
    }
  }
}

async function handleCandles (exec, db, btState, opts) {
  const { tf, start, end, exchange, symbol } = opts

  const query = {
    gte: { candle: tf, timestamp: start },
    lte: { candle: tf, timestamp: end }
  }

  const stream = db.createReadStream(query)

  const candleFormat = getLegacyCandleFormatter({ exchange, symbol, tf })
  const candleData = []

  for await (const data of stream) {
    const { key, value } = data
    btState = await exec(key, value)
    const candle = candleFormat(value)
    candleData.push(candle)
  }

  return candleData
}

async function handleTrades (exec, db, btState, opts) {
  const { start, end } = opts

  const query = {
    gte: { timestamp: start },
    lte: { timestamp: end }
  }

  const stream = db.createReadStream(query)
  for await (const data of stream) {
    const { key, value } = data
    btState = await exec(key, value)
  }

  return btState
}

module.exports = async (ds, ws, msg) => {
  try {
    const { dir } = ds

    const [
      exchange, start, end, symbol, ids, tf, opts, strategyContent, meta
    ] = msg[1] || []

    const { store, terms } = opts

    const tasks = ids.map(async (args) => {
      const [id, type] = args

      let dmarket
      if (store) {
        const dbp = path.join(dir, 'dazaar', id + '_' + type + '_' + symbol)
        dmarket = dazaar(dbp)
      } else {
        dmarket = dazaar(() => ram())
      }

      const buyer = dmarket.buy({ id }, { sparse: true, terms })
      const { db, replication } = await getDatabase(buyer)

      buyer.on('error', (err) => {
        console.error(err)

        if (/^Terms of Use updated/.test(err.message)) {
          send(ws, ['bt.btresult', { error: 'ERR_TOS_OUTDATED' }, meta])
        }
      })

      return { id, buyer, db, replication, type }
    })

    const cores = await Promise.all(tasks)

    let strategy
    try {
      strategy = parseStrategy(strategyContent)
    } catch (e) {
      console.error(e)
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

    debug(
      'running backtest for %s:%s [%s]',
      symbol, tf, rangeString(start, end)
    )

    let { exec, onEnd, onStart, btState } = await execStream(strategy, { symbol, tf }, {
      from: start,
      to: end,
      manualOnStart: true
    })

    btState = await onStart(btState, [null, null, null, start, end])

    const streamTasks = cores.map(async (core) => {
      const { id, buyer, db, replication, type } = core
      const opts = { tf, start, end, exchange, symbol }

      let candleData
      switch (type) {
        case 'candles':
          candleData = await handleCandles(exec, db, btState, opts)
          break
        case 'trades':
          await handleTrades(exec, db, btState, opts)
          break
        default:
          console.error('ERR_TYPE_UNKN:', type)
          return send(ws, ['bt.btresult', { error: 'ERR_TYPE_UNKN: Core type unknown' }, meta])
      }

      buyer.feed.close()
      replication.destroy()

      return { id, candleData }
    })

    const results = await Promise.all(streamTasks)
    const { candleData } = results.reduce((acc, el) => {
      if (el.candleData) {
        acc.candleData = el.candleData
      }

      return acc
    }, { candleData: [] })

    btState = await onEnd(btState)

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
  } catch (e) {
    console.error('ERR_EXEC', e)
    return sendError(ws, { res: 'ERR_EXEC: ' + e.message, code: 500 })
  }
}
