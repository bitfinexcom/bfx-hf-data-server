'use strict'

const debug = require('debug')('bfx:hf:data-server:wss:send-error')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')

const send = require('./send')

// Errors are thrown here since the err object must be well-formed to be sent
// out as a ws message. Logging the error is not sufficient, since it would
// result in a malformed ws error packet (and cause problems in the client)
module.exports = (ws, err) => {
  if (!_isFinite(err.code)) {
    throw new Error(`invalid error code: ${err.code}`)
  } else if (!_isString(err.res)) {
    throw new Error(`invalid error response: ${err.res}`)
  } else if (_isEmpty(err.res)) {
    throw new Error(`empty error response for code: ${err.code}`)
  }

  debug('%s (%d)', err.res, err.code)
  send(ws, ['error', `${err.res} (code: ${err.code})`])
}
