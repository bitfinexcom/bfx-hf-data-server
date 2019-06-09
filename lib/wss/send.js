'use strict'

const debug = require('debug')('bfx:hf:data-server:wss:send')
const WS = require('ws')

module.exports = (ws, msg = []) => {
  if (ws.readyState === WS.OPEN) {
    ws.send(JSON.stringify(msg))
  } else {
    debug('ws not open (%d), refusing: %j', ws.readyState, msg)
  }
}
