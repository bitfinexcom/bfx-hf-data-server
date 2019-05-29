'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:submit-bt')
const _isFinite = require('lodash/isFinite')

const ERRORS = require('../errors')
const send = require('../wss/send')
const sendError = require('../wss/send_error')
const db = require('../db')

const { Backtest } = db
const { get: getBT, create: createBT } = Backtest

module.exports = async (ds, ws, msg) => {
  const [
    btID, strategyID, indicators, trades, symbol, tf, from, to
  ] = msg[1]

  if (!_isFinite(btID)) {
    return sendError(ws, ERRORS.BACKTEST.BT_ID_REQUIRED)
  } else if (!_isFinite(strategyID)) {
    return sendError(ws, ERRORS.BACKTEST.ST_ID_REQUIRED)
  } else if (!!getBT({ btID, strategyID })) {
    return sendError(ws, ERRORS.BACKTEST.DUPLICATE)
  }

  debug('creating backtest %s', btID)

  const bt = createBT({
    btID, strategyID, indicators, symbol, trades, from, to, tf,
  })

  send(ws, ['data.bt', bt]) 
}
