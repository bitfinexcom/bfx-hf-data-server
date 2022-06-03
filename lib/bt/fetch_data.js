const { DEFAULT_ITEMS_LIMIT } = require('./constants')

/**
 * @param {RESTv2} rest
 * @param {string} symbol
 * @param {string} tf
 * @param {number} start
 * @param {number} end
 * @return {function(*, *): *}
 */
const fetchCandles = (rest, { symbol, tf }) => {
  return (offset, end) => {
    return rest.candles({
      timeframe: tf,
      symbol,
      query: {
        limit: DEFAULT_ITEMS_LIMIT,
        start: offset,
        end,
        sort: 1
      }
    })
  }
}

/**
 * @param {RESTv2} rest
 * @param {string} symbol
 * @return {function(*, *): *}
 */
const fetchTrades = (rest, { symbol }) => {
  return (offset, end, limit = DEFAULT_ITEMS_LIMIT, sort = 1) => {
    return rest.trades(symbol, offset, end, limit, sort)
  }
}

module.exports = {
  fetchTrades,
  fetchCandles
}
