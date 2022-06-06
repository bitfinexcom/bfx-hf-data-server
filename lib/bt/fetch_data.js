const { DEFAULT_ITEMS_LIMIT } = require('./constants')

/**
 * @param {RESTv2} rest
 * @param {RequestSemaphore} semaphore
 * @param {string} symbol
 * @param {string} tf
 * @return {function(*, *): *}
 */
const fetchCandles = (rest, semaphore, { symbol, tf }) => {
  return (offset, end) => {
    return semaphore.add(
      rest.candles.bind(rest, {
        timeframe: tf,
        symbol,
        query: {
          limit: DEFAULT_ITEMS_LIMIT,
          start: offset,
          end,
          sort: 1
        }
      })
    )
  }
}

/**
 * @param {RESTv2} rest
 * @param {RequestSemaphore} semaphore
 * @param {string} symbol
 * @return {function(*, *): *}
 */
const fetchTrades = (rest, semaphore, { symbol }) => {
  return (offset, end, limit = DEFAULT_ITEMS_LIMIT, sort = 1) => {
    return semaphore.add(
      rest.trades.bind(rest, symbol, offset, end, limit, sort)
    )
  }
}

module.exports = {
  fetchTrades,
  fetchCandles
}
