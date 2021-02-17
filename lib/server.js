'use strict'

const debug = require('debug')('bfx:hf:data-server')
const _isFunction = require('lodash/isFunction')
const { RESTv2 } = require('bfx-api-node-rest')
const { nonce } = require('bfx-api-node-util')
const Promise = require('bluebird')
const WS = require('ws')

const { VERSION } = require('../package.json')
const getCandles = require('./cmds/get_candles')
const getMarkets = require('./cmds/get_markets')
const getTrades = require('./cmds/get_trades')
const getBTs = require('./cmds/get_bts')
const execBT = require('./cmds/exec_bt')
const execStr = require('./cmds/exec_strategy')
const submitBT = require('./cmds/submit_bt')
const sendError = require('./wss/send_error')
const send = require('./wss/send')
const ERRORS = require('./errors')

const COMMANDS = {
  'exec.str': execStr,
  'exec.bt': execBT,
  'get.bts': getBTs,
  'get.markets': getMarkets,
  'get.candles': getCandles,
  'get.trades': getTrades,
  'submit.bt': submitBT
}

/**
 * Honey Framework Data Server
 */
class DataServer {
  /**
   * @param {Object} args
   * @param {Object} db - bfx-hf-models DB instance
   * @param {string} restURL - bitfinex RESTv2 API URL
   * @param {number} port - websocket server port
   */
  constructor ({
    db,
    restURL,
    port,
    agent
  } = {}) {
    this.db = db
    this.activeSyncs = [] // sync ranges
    this.syncExpectants = [] // promises awaiting sync end, keyed by sync range
    this.wssClients = {}

    this.rest = new RESTv2({
      agent,
      transform: true,
      url: restURL
    })

    this.port = port
    this.wss = null
  }

  /**
   * Spawns the WebSocket API server; throws an error if it is already open
   */
  open () {
    if (this._wss) {
      throw new Error('already open')
    }

    this.wss = new WS.Server({
      clientTracking: true,
      port: this.port
    })

    this.wss.on('connection', this.onWSConnected.bind(this))

    debug('websocket API open on port %d', this.port)
  }

  /**
   * Closes the WebSocket API server; throws an error if it is not open
   */
  close () {
    if (!this.wss) {
      throw new Error('already closed')
    }

    this.wss.close()
    this.wss = null
  }

  /**
   * @private
   */
  static getSyncKeyforRange ({ exchange, symbol, tf, start, end } = {}) {
    return `${exchange}-${symbol}-${tf}-${start}-${end}`
  }

  /**
   * Returns an array of active sync ranges
   *
   * @return {Object[]} ranges
   */
  getRunningSyncRanges () {
    return Object.keys(this.activeSyncs).map(k => {
      const [exchange, symbol, tf, start, end] = k.split('-')

      return {
        exchange,
        symbol,
        tf,
        start: +start,
        end: +end
      }
    })
  }

  /**
   * Queries if an active sync exists covering the specified range
   *
   * @param {Object} range
   * @param {number} range.start
   * @param {number} range.end
   * @param {string} range.exchange
   * @param {string} range.symbol
   * @param {string} range.tf
   * @return {boolean} isActive
   */
  isSyncActive ({ exchange, symbol, tf, start, end }) {
    const runningSyncs = this.getRunningSyncRanges()

    if (runningSyncs.length === 0) {
      return false
    }

    const relevantSyncs = runningSyncs.filter(s =>
      s.exchange === exchange && s.symbol === symbol && s.tf === tf
    )

    relevantSyncs.sort((a, b) => a.start - b.start)

    for (let i = 0; i < relevantSyncs.length; i += 1) {
      if (start >= relevantSyncs[i].start && end <= relevantSyncs[i].end) {
        return true // engulfed
      }
    }

    return false // if not engulfed, will be optimized with @optimizeSyncRange()
  }

  /**
   * @private
   */
  futureSyncFor ({ exchange, symbol, tf, start }) {
    const runningSyncs = this.getRunningSyncRanges().filter(s => (
      s.exchange === exchange && s.symbol === symbol && s.tf === tf
    ))

    if (runningSyncs.length === 0) {
      return false
    }

    return runningSyncs.find((sync) => {
      return sync.start > start
    })
  }

  /**
   * Returns a promise that resolves when a sync covering the specified range
   * finishes. If no such sync is active, this is a no-op.
   *
   * @param {Object} range
   * @param {number} range.start
   * @param {number} range.end
   * @param {string} range.exchange
   * @param {string} range.symbol
   * @param {string} range.tf
   * @return {Promise} p - resolves on sync completion
   */
  expectSync ({ exchange, symbol, tf, start, end }) {
    const key = DataServer.getSyncKeyforRange({
      exchange, symbol, tf, start, end
    })

    if (!this.activeSyncs[key]) {
      debug('error: tried to expect non-existent sync (%s)', key)
      return
    }

    return new Promise((resolve) => {
      this.syncExpectants[key].push(resolve)
    })
  }

  /**
   * Returns a sync range that takes into account active syncs, to prevent
   * overlapping sync tasks.
   *
   * @param {Object} range
   * @param {string} range.exchange
   * @param {string} range.symbol
   * @param {string} range.tf
   * @param {number} range.start
   * @param {number} range.end
   * @return {Object} optimalRange - null if sync not required at all
   */
  optimizeSyncRange ({ exchange, symbol, tf, start, end }) {
    const runningSyncs = this.getRunningSyncRanges().filter(s => (
      s.exchange === exchange && s.tf === tf && s.symbol === symbol
    ))

    if (runningSyncs.length === 0) {
      return { exchange, symbol, tf, start, end }
    }

    runningSyncs.sort((a, b) => b.start - a.start)

    let sync
    let optimalStart = start
    let optimalEnd = end

    for (let i = 0; i < runningSyncs.length; i += 1) {
      sync = runningSyncs[i]

      if (optimalStart >= sync.start && optimalEnd <= sync.end) { // engulfed
        return null
      }

      if (optimalStart >= sync.start && optimalStart <= sync.end) { // start already covered
        optimalStart = sync.end
      } else if (optimalEnd >= sync.start && optimalEnd <= sync.end) { // end already covered
        optimalEnd = sync.start
      }
    }

    if (optimalStart !== start || optimalEnd !== end) {
      debug(
        'optimised sync (%d -> %d) - (%d -> %d)',
        start, optimalStart, end, optimalEnd
      )
    }

    return {
      exchange,
      symbol,
      tf,
      start: optimalStart,
      end: optimalEnd
    }
  }

  /**
   * Notify the server that a sync is running for the specified range/market
   *
   * @param {Object} args
   * @param {string} args.exchange
   * @param {string} args.symbol
   * @param {string} args.tf
   * @param {number} args.start
   * @param {number} args.end
   */
  notifySyncStart ({ exchange, symbol, tf, start, end }) {
    const key = DataServer.getSyncKeyforRange({
      exchange, symbol, tf, start, end
    })

    if (this.activeSyncs[key]) {
      debug('error: notified start of sync that is already running (%s)', key)
      return
    }

    debug('sync started: %s', key)

    this.activeSyncs[key] = true
    this.syncExpectants[key] = []
  }

  /**
   * Notify the server that a sync has finished for the specified range/market
   *
   * @param {Object} args
   * @param {string} args.exchange
   * @param {string} args.symbol
   * @param {string} args.tf
   * @param {number} args.start
   * @param {number} args.end
   */
  notifySyncEnd ({ exchange, symbol, tf, start, end }) {
    const key = DataServer.getSyncKeyforRange({
      exchange, symbol, tf, start, end
    })

    if (!this.activeSyncs[key]) {
      debug('error: notified end of unknown sync (%s)', key)
      return
    }

    debug('sync ended: %s', key)

    this.syncExpectants[key].forEach(resolve => resolve())

    delete this.syncExpectants[key]
    delete this.activeSyncs[key]
  }

  /**
   * @private
   */
  onWSConnected (ws) {
    debug('ws client connected')

    const clientID = nonce()

    this.wssClients[clientID] = ws

    ws.on('message', this.onWSMessage.bind(this, clientID))
    ws.on('close', this.onWSDisconnected.bind(this, clientID))

    send(ws, ['connected', VERSION])
  }

  /**
   * @private
   */
  onWSDisconnected (clientID) {
    debug('ws client %s disconnected', clientID)

    delete this.wssClients[clientID]
  }

  /**
   * @private
   */
  onWSMessage (clientID, msgJSON = '') {
    const ws = this.wssClients[clientID]

    let msg

    try {
      msg = JSON.parse(msgJSON)
    } catch (e) {
      debug('error reading ws client msg: %s', msgJSON)
    }

    if (!Array.isArray(msg)) {
      return sendError(ws, ERRORS.GENERIC.MSG_NOT_ARRAY)
    }

    const [cmd] = msg
    const handler = COMMANDS[cmd]

    if (!_isFunction(handler)) {
      return sendError(ws, ERRORS.GENERIC.UNKNOWN_COMMAND)
    }

    handler(this, ws, msg, clientID).catch((err) => {
      debug('error processing message: %s', err.stack)
      return sendError(ws, ERRORS.GENERIC.INTERNAL)
    })
  }
}

module.exports = DataServer
