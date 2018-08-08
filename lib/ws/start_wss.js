'use strict'

const debug = require('debug')('hf:data-server:ws:start_wss')
const WS = require('ws')
const onWSConnected = require('./events/on_connect')

module.exports = (dsState) => {
  const { port } = dsState
  const wss = new WS.Server({ port })

  wss.on('connection', ws => {
    onWSConnected(dsState, ws)
  })

  debug(`websocket API open on localhost:${port}`)

  return wss
}
