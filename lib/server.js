'use strict'

const debug = require('debug')('bfx:hf:data-server')
const _isFunction = require('lodash/isFunction')
const _isEmpty = require('lodash/isEmpty')
const { RESTv2 } = require('bfx-api-node-rest')
const { WSv2 } = require('bitfinex-api-node')
const { nonce } = require('bfx-api-node-util')
const Promise = require('bluebird')
const WS = require('ws')

const { VERSION } = require('../package.json')
const getCandles = require('./cmds/get_candles')
const getMarkets = require('./cmds/get_markets')
const getTrades = require('./cmds/get_trades')
const getBTs = require('./cmds/get_bts')
const execBT = require('./cmds/exec_bt')
const submitBT = require('./cmds/submit_bt')
const proxyBFXMessage = require('./cmds/proxy_bfx_message')
const sendError = require('./wss/send_error')
const send = require('./wss/send')
const ERRORS = require('./errors')

const COMMANDS = {
  'exec.bt': execBT,
  'get.bts': getBTs,
  'get.markets': getMarkets,
  'get.candles': getCandles,
  'get.trades': getTrades,
  'submit.bt': submitBT,
  'bfx': proxyBFXMessage
}

module.exports = class DataServer {
  /**
   * @param {Object} args
   * @param {Object} db - bfx-hf-models DB instance
   * @param {string} apiKey - for bfx proxy
   * @param {string} apiSecret - for bfx proxy
   * @param {Object} agent - optional proxy agent for bfx proxy connection
   * @param {string} wsURL - bitfinex websocket API URL
   * @param {string} restURL - bitfinex RESTv2 API URL
   * @param {boolean} transform - for bfx proxy
   * @param {boolean} proxy - if true, a bfx proxy will be opened for every client
   * @param {number} port - websocket server port
   */
  constructor ({
    db,
    apiKey,
    apiSecret,
    agent,
    restURL,
    wsURL,
    transform,
    proxy,
    port
  } = {}) {
    this.db = db
    this.activeSyncs = [] // sync ranges
    this.syncExpectants = [] // promises awaiting sync end, keyed by sync range
    this.wssClients = {}
    this.bfxProxies = {} // one per client ID if enabled
    this.bfxProxyEnabled = proxy
    this.bfxProxyParams = {
      url: wsURL,
      apiKey,
      apiSecret,
      transform,
      agent
    }

    this.rest = new RESTv2({
      agent,
      transform: true,
      url: restURL,
    })

    this.port = port
    this.wss = null
  }

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

  close () {
    if (!this.wss) {
      throw new Error('already closed')
    }

    this.wss.close()
    this.wss = null

    Object.values(this.bfxProxies).forEach(proxy => proxy.close())
    this.bfxProxies = {}
  }

  static getSyncKeyforRange ({ exchange, symbol, tf, start, end } = {}) {
    return `${exchange}-${symbol}-${tf}-${start}-${end}`
  }

  getRunningSyncRanges () {
    return Object.keys(this.activeSyncs).map(k => {
      const [start, end] = k.split('-')
      return {
        start: +start,
        end: +end,
      }
    })
  }

  isSyncActive ({ start, end }) {
    const runningSyncs = this.getRunningSyncRanges()

    if (runningSyncs.length === 0) {
      return false
    }

    runningSyncs.sort((a, b) => a.start - b.start)

    for (let i = 0; i < runningSyncs.length; i += 1) {
      if (start >= runningSyncs[i].start && end <= runningSyncs[i].end) {
        return true // engulfed
      }
    }

    return false // if not engulfed, will be optimized with @optimizeSyncRange()
  }

  futureSyncFor ({ exchange, symbol, tf, start, end }) {
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

  expectSync ({ start, end }) {
    const key = DataServer.getSyncKeyforRange({ start, end })

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
      exchange, symbol, tf,
      start: optimalStart,
      end: optimalEnd,
    }
  }

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

  notifySyncEnd ({ exchange, symbol, tf, start, end }) {
    const key = DataServer.getSyncKeyforRange({
      exchange, symbol, tf, start, end,
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

  onWSConnected (ws) {
    debug('ws client connected')

    const clientID = nonce()

    this.wssClients[clientID] = ws

    ws.on('message', this.onWSMessage.bind(this, clientID))
    ws.on('close', this.onWSDisconnected.bind(this, clientID))

    if (this.bfxProxyEnabled) {
      this.bfxProxies[clientID] = this.openBFXProxy(clientID)
      debug('opened bfx proxy for client %d', clientID)
    }

    send(ws, ['connected', VERSION])
  }

  onWSDisconnected (clientID) {
    debug('ws client %s disconnected', clientID)

    delete this.wssClients[clientID]

    if (this.bfxProxies[clientID]) {
      if (this.bfxProxies[clientID].isOpen()) {
        this.bfxProxies[clientID].close()
      }

      delete this.bfxProxies[clientID]
    }
  }

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

    const [ cmd ] = msg
    const handler = COMMANDS[cmd]

    if (!_isFunction(handler)) {
      return sendError(ws, ERRORS.GENERIC.UNKNOWN_COMMAND)
    }

    handler(this, ws, msg, clientID).catch((err) => {
      debug('error processing message: %s', err.stack)
      return sendError(ws, ERRORS.GENERIC.INTERNAL)
    })
  }

  openBFXProxy (clientID) {
    const proxy = new WSv2(this.bfxProxyParams)

    proxy._preOpenMessageBuffer = [] // see proxy_bfx_message cmd

    proxy.on('message', (msg) => {
      if (proxy.__closing) {
        return
      }

      const ws = this.wssClients[clientID]

      if (!ws) {
        debug('recv proxy message for unknown client ID: %s', clientID)

        if (!this.bfxProxies[clientID]) {
          debug('proxy %d no longer needed, closing...', clientID )
          proxy.__closing = true // prevents future message handling (high-speed)
          proxy.close()
        }

        return
      }

      if (ws.readyState !== 1) {
        return
      }

      debug('proxying message %j to client %s', msg, clientID)

      ws.send(JSON.stringify(['bfx', msg]))
    })

    proxy.on('open', () => {
      debug('bfx proxy connection opened')
    })

    proxy.on('auth', () => {
      debug('bfx proxy connection authenticated')

      if (!_isEmpty(proxy._preOpenMessageBuffer)) {
        debug('flushing %d buffered messages to proxy', proxy._preOpenMessageBuffer.length)
        proxy._preOpenMessageBuffer.forEach(msg => proxy.send(msg))
        proxy._preOpenMessageBuffer = []
      }
    })

    proxy.on('close', () => {
      debug('bfx proxy connection closed')
    })

    proxy.on('error', (err) => {
      debug('bfx proxy error: %j', err)
    })

    proxy.once('open', () => {
      if (this.bfxProxyParams.apiKey && this.bfxProxyParams.apiSecret) {
        proxy.auth()
      }
    })

    proxy.open()

    return proxy
  }
}
