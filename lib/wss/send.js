'use strict'

const debug = require('debug')('bfx:hf:data-server:wss:send')
const WS = require('ws')

/**
 * @private
 *
 * @param {ws.WebSocket} ws - client
 * @param {Array} msg - outgoing message array
 */
const send = (ws, msg = []) => {
  if (ws.readyState === WS.OPEN) {
    ws.send(JSON.stringify(msg))
  } else {
    debug('ws not open (%d), refusing: %j', ws.readyState, msg)
  }
}

module.exports = send
