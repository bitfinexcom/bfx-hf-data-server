'use strict'

const debug = require('debug')('bfx:hf:data-server:wss:events:on_connect')
const onMessage = require('./on_message')
const onDisconnect = require('./on_disconnect')
const send = require('../send')
const getMarkets = require('../cmds/get_markets')

module.exports = (dsState, ws) => {
  debug('ws client connected')

  ws.on('message', msg => onMessage(dsState, ws, msg))
  ws.on('close', () => onDisconnect(ws))

  send(ws, ['connected'])
  getMarkets(dsState, ws)
}
