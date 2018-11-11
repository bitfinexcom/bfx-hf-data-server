'use strict'

const debug = require('debug')('bfx:hf:data-server')
const _isFunction = require('lodash/isFunction')
const { RESTv2 } = require('bfx-api-node-rest')
const WS = require('ws')

const getCandles = require('./cmds/get_candles')
const getMarkets = require('./cmds/get_markets')
const getTrades = require('./cmds/get_trades')
const getBTs = require('./cmds/get_bts')
const execBT = require('./cmds/exec_bt')
const submitBT = require('./cmds/submit_bt')
const send = require('./wss/send')

const COMMANDS = {
  'exec.bt': execBT,
  'get.bts': getBTs,
  'get.markets': getMarkets,
  'get.candles': getCandles,
  'get.trades': getTrades,
  'submit.bt': submitBT
}

module.exports = class DataServer {
  constructor ({ port } = {}) {
    this.rest = new RESTv2({ transform: true })
    this.wss = new WS.Server({ port })
    this.wss.on('connection', this.onWSConnected.bind(this))

    debug('websocket API open on port %d', port)
  }

  close () {
    this.wss.close()
  }

  onWSConnected (ws) {
    debug('ws client connected')

    ws.on('message', this.onWSMessage.bind(this, ws))
    ws.on('close', this.onWSDisconnected.bind(this, ws))

    send(ws, ['connected'])
  }

  onWSDisconnected (ws) {
    debug('ws client disconnected')
  }

  onWSMessage (ws, msgJSON = '') {
    let msg

    try {
      msg = JSON.parse(msgJSON)
    } catch (e) {
      debug('error reading ws client msg: %s', msgJSON)
    }

    if (!Array.isArray(msg)) {
      debug('ws client msg not an array: %j', msg)
      return
    }

    const [ cmd ] = msg
    const handler = COMMANDS[cmd]

    if (!_isFunction(handler)) {
      debug('received unknown command: %s', cmd)
      return
    }

    return handler(this, ws, msg)
  }
}
