'use strict'

const debug = require('debug')('bfx:hf:data-server:wss:send-error')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')

const send = require('./send')

// TODO: Disable throws in production (?)
module.exports = (ws, err) => {
  if (!_isFinite(err.code)) {
    throw new Error(`invalid error code: ${err.code}`)
  } else if (!_isString(err.res)) {
    throw new Error(`invalid error response: ${err.res}`)
  } else if (_isEmpty(err.res)) {
    throw new Error(`empty error response for code: ${err.code}`)
  }

  debug('%s (%d)', err.res, err.code)
  send(ws, ['error', err.code, err.res])
}
