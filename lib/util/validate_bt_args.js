'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const _isBoolean = require('lodash/isBoolean')
const { candleWidth } = require('bfx-hf-util')
const ERRORS = require('../errors')

/**
 * @param {*[]} msg - bt exec ws request
 * @return {string|null} error
 */
module.exports = (msg = []) => {
  const [
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync
  ] = msg[1] || []

  if (!_isString(symbol)) {
    return ERRORS.BACKTEST.EXCHANGE_NOT_STRING
  } else if (!_isFinite(start)) {
    return ERRORS.BACKTEST.INVALID_START
  } else if (!_isFinite(end)) {
    return ERRORS.BACKTEST.INVALID_END
  } else if (start > end) {
    return ERRORS.BACKTEST.START_BEFORE_END
  } else if (!_isFinite(candleWidth(tf))) {
    return ERRORS.BACKTEST.INVALID_TF
  } else if (!_isString(symbol)) {
    return ERRORS.BACKTEST.SYMBOL_NOT_STRING
  } else if (!_isBoolean(includeCandles)) {
    return ERRORS.BACKTEST.INVALID_INCLUDE_CANDLES
  } else if (!_isBoolean(includeTrades)) {
    return ERRORS.BACKTEST.INVALID_INCLUDE_TRADES
  } else if (!_isBoolean(sync)) {
    return ERRORS.BACKTEST.INVALID_SYNC
  } else if (!includeCandles && !includeTrades) {
    return ERRORS.BACKTEST.REQ_EMPTY
  }

  return null
}
