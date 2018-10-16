'use strict'

const _isArray = require('lodash/isArray')
const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const { candleWidth } = require('bfx-hf-util')

/**
 * @param {*[]} msg - bt exec ws request
 * @return {string|null} error
 */
module.exports = (msg = []) => {
  const [
    start, end, symbol, tf, candles, trades, candleFields, tradeFields,
    sync = true
  ] = msg[1] || []

  if (!_isFinite(start)) {
    return `invalid start: ${start}`
  } else if (!_isFinite(end)) {
    return `invalid end: ${end}`
  } else if (start > end) {
    return `start before end: ${start} > ${end}`
  } else if (!_isFinite(candleWidth(tf))) {
    return `invalid timeframe: ${tf}`
  } else if (!_isString(symbol)) {
    return `symbol not a string: ${symbol}`
  } else if ((typeof tradeFields !== 'undefined') && (
    !_isArray(tradeFields) && !_isString(tradeFields)
  )) {
    return `trade fields provided but not an array or string: ${tradeFields}`
  } else if ((typeof candleFields !== 'undefined') && (
    !_isArray(candleFields) && !_isString(candleFields)
  )) {
    return `candle fields provided but not an array or string: ${candleFields}`
  }

  return null
}
