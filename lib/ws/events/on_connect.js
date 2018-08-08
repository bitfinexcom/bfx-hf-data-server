'use strict'

const debug = require('debug')('hf:data:ws:events:on_connect')
const onMessage = require('./on_message')
const onDisconnect = require('./on_disconnect')
const send = require('../../ws/send')
const getCandleChunks = require('../cmds/get_candle_chunks')
const getMarkets = require('../cmds/get_markets')

module.exports = (dsState, ws) => {
  const { rest } = dsState

  debug('ws client connected')

  ws.on('message', msg => onMessage(dsState, ws, msg))
  ws.on('close', () => onDisconnect(ws))

  send(ws, ['connected'])
  getMarkets(dsState, ws)
  getCandleChunks(dsState, ws)
}
