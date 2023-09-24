'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const _isBoolean = require('lodash/isBoolean')
const { candleWidth } = require('bfx-hf-util')

const ERRORS = require('../errors')

/**
 * @param {*[]} msg - bt exec ws request
 * @return {{res: string, code: number}|null} error
 */
module.exports = (msg = []) => {
  const [
    , , start, end, symbol, tf, includeCandles, includeTrades, candleSeed, sync, margin, , , constraints = {}, leverageSettings = {}, stopOrderSettings = {}
  ] = msg[1] || []
  const { capitalAllocation, maxDrawdownPerc, stopLossPerc } = constraints
  const { useMaxLeverage, increaseLeverage, leverage } = leverageSettings
  const { addStopOrder, stopOrderPercent } = stopOrderSettings

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
  } else if (!_isFinite(capitalAllocation)) {
    return ERRORS.BACKTEST.INVALID_ALLOCATION
  } else if (maxDrawdownPerc && !_isFinite(maxDrawdownPerc)) {
    return ERRORS.BACKTEST.INVALID_MAX_DRAWDOWN
  } else if (stopLossPerc && !_isFinite(stopLossPerc)) {
    return ERRORS.BACKTEST.INVALID_PERC_STOP_LOSS
  } else if (!_isFinite(candleSeed)) {
    return ERRORS.BACKTEST.INVALID_CANDLE_SEED
  } else if (!_isBoolean(margin)) {
    return ERRORS.BACKTEST.INVALID_MARGIN
  } else if (margin && !_isBoolean(useMaxLeverage)) {
    return ERRORS.BACKTEST.INVALID_USE_MAX_LEVERAGE
  } else if (useMaxLeverage === false && (!_isFinite(leverage) || !leverage)) {
    return ERRORS.BACKTEST.INVALID_LEVERAGE
  } else if (useMaxLeverage === false && !_isBoolean(increaseLeverage)) {
    return ERRORS.BACKTEST.INVALID_INCREASE_LEVERAGE
  } else if (margin && !_isBoolean(addStopOrder)) {
    return ERRORS.BACKTEST.INVALID_ADD_STOP_ORDER
  } else if (addStopOrder && (!_isFinite(stopOrderPercent) || !stopOrderPercent)) {
    return ERRORS.BACKTEST.INVALID_STOP_ORDER_PERCENT
  }

  return null
}
