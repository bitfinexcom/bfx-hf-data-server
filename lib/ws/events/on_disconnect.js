'use strict'

const debug = require('debug')('hf:data-server:ws:events:on_close')

module.exports = (dsState, ws) => {
  debug('ws client disconnected')
}
