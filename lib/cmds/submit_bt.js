'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:submit-bt')
const _isFinite = require('lodash/isFinite')

const ERRORS = require('../errors')
const send = require('../wss/send')
const sendError = require('../wss/send_error')

/**
 * @private
 *
 * @param {HFDataServer} ds - server
 * @param {ws.WebSocket} ws - client
 * @param {Array} msg - incoming message
 * @returns {Promise} p
 */
const submitBT = async (ds, ws, msg) => {
  const [
    btID, strategyID, indicators, trades, symbol, tf, from, to
  ] = msg[1]

  const { db } = ds
  const { Backtest } = db

  if (!_isFinite(btID)) {
    return sendError(ws, ERRORS.BACKTEST.BT_ID_REQUIRED)
  } else if (!_isFinite(strategyID)) {
    return sendError(ws, ERRORS.BACKTEST.ST_ID_REQUIRED)
  }

  const existingBT = await Backtest.get({ btID, strategyID })

  if (existingBT) {
    return sendError(ws, ERRORS.BACKTEST.DUPLICATE)
  }

  debug('creating backtest %s', btID)

  const bt = await Backtest.create({
    btID, strategyID, indicators, symbol, trades, from, to, tf
  })

  send(ws, ['data.bt', bt])
}

module.exports = submitBT
