'use strict'

const debug = require('debug')('hf:data-server:wss:events:on_close')

module.exports = (dsState, ws) => {
  debug('ws client disconnected')
}
