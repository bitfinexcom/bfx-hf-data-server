'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const _isBoolean = require('lodash/isBoolean')
const { candleWidth } = require('bfx-hf-util')
const EXIT_MODES = require('bfx-hf-strategy-perf/src/ExitModes')

const ERRORS = require('../errors')

/**
 * @param {*[]} msg - bt exec ws request
 * @return {{res: string, code: number}|null} error
 */
module.exports = (msg = []) => {
  const [
    , start, end, symbol, tf, includeCandles, includeTrades, sync, strategyContent, meta, constraints = {}
  ] = msg[1] || []
  const { allocation, maxPositionSize, maxDrawdown, absStopLoss, percStopLoss, exitPositionMode } = constraints

  if (!_isFinite(start)) {
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
  } else if (!_isFinite(allocation)) {
    return ERRORS.BACKTEST.INVALID_ALLOCATION
  } else if (maxPositionSize && !_isFinite(maxPositionSize)) {
    return ERRORS.BACKTEST.INVALID_MAX_POSITION_SIZE
  } else if (maxDrawdown && !_isFinite(maxDrawdown)) {
    return ERRORS.BACKTEST.INVALID_MAX_DRAWDOWN
  } else if (absStopLoss && !_isFinite(absStopLoss)) {
    return ERRORS.BACKTEST.INVALID_ABS_STOP_LOSS
  } else if (percStopLoss && !_isFinite(percStopLoss)) {
    return ERRORS.BACKTEST.INVALID_PERC_STOP_LOSS
  } else if ((maxDrawdown || absStopLoss || percStopLoss) && exitPositionMode && !EXIT_MODES[exitPositionMode]) {
    return ERRORS.BACKTEST.INVALID_EXIT_MODE
  }

  return null
}
