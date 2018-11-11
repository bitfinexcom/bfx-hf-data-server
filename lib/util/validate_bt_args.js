'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const _isBoolean = require('lodash/isBoolean')
const { candleWidth } = require('bfx-hf-util')

/**
 * @param {*[]} msg - bt exec ws request
 * @return {string|null} error
 */
module.exports = (msg = []) => {
  const [
    start, end, symbol, tf, includeCandles, includeTrades, sync
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
  } else if (!_isBoolean(includeCandles)) {
    return `invalid includeCandles flag: ${includeCandles}`
  } else if (!_isBoolean(includeTrades)) {
    return `invalid includeTrades flag: ${includeTrades}`
  } else if (!_isBoolean(sync)) {
    return `invalid sync flag: ${sync}`
  }

  return null
}
