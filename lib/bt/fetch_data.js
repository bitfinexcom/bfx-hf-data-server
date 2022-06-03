const { MAX_ITEMS_PER_REQUEST, TIMEFRAME_IN_MS } = require('./constants')

const calcIdealBatchSize = ({ start, end, tf, max = MAX_ITEMS_PER_REQUEST }) => {
  const diff = end - start
  const ms = TIMEFRAME_IN_MS[tf]
  if (!ms) {
    return max
  }
  return Math.min(Math.ceil(diff / ms), max)
}

/**
 * @param {RESTv2} rest
 * @param {string} symbol
 * @param {string} tf
 * @param {number} start
 * @param {number} end
 * @return {function(*, *): *}
 */
const fetchCandles = (rest, { symbol, tf, start, end }) => {
  const limit = calcIdealBatchSize({ start, end, tf })

  return (offset, end) => {
    return rest.candles({
      timeframe: tf,
      symbol,
      query: { limit, start: offset, end, sort: 1 }
    })
  }
}

/**
 * @param {RESTv2} rest
 * @param {string} symbol
 * @return {function(*, *): *}
 */
const fetchTrades = (rest, { symbol }) => {
  return (offset, end, limit = MAX_ITEMS_PER_REQUEST, sort = 1) => {
    return rest.trades(symbol, offset, end, limit, sort)
  }
}

module.exports = {
  fetchTrades,
  fetchCandles
}
