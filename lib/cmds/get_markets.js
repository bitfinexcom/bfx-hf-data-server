'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:get-markets')
const _toUpper = require('lodash/toUpper')
const { TIME_FRAMES } = require('bfx-hf-util')
const sendError = require('../wss/send_error')
const send = require('../wss/send')
const ERRORS = require('../errors')

/**
 * @memberof module:bfx-hf-data-server
 * @private
 * @async
 *
 * @param {module:bfx-hf-data-server.Server} dsState - server
 * @param {WebSocket} ws - client
 */
const getMarkets = async (dsState, ws) => {
  const { rest } = dsState
  let symbolsRaw

  try {
    symbolsRaw = await rest.symbols()
  } catch (e) {
    debug('bfx API error: %s', e.message)
    return sendError(ws, ERRORS.GENERIC.BFX_REST_ERROR)
  }

  const symbols = symbolsRaw.map(sym => `t${_toUpper(sym)}`)
  const timeframes = Object.values(TIME_FRAMES)

  send(ws, ['data.markets', symbols, timeframes])
}

module.exports = getMarkets
