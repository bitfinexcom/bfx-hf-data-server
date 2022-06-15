const { DEFAULT_ITEMS_LIMIT } = require('./constants')

/**
 * @param {RESTv2} rest
 * @param {RequestSemaphore} semaphore
 * @param {string} symbol
 * @param {string} timeframe
 * @return {function(*, *): *}
 */
const fetchCandles = (rest, semaphore, { symbol, timeframe }) => {
  return async (offset, end, limit = DEFAULT_ITEMS_LIMIT) => {
    const candles = await semaphore.add(
      rest.candles.bind(rest, {
        timeframe,
        symbol,
        query: {
          limit,
          start: offset,
          end,
          sort: 1
        }
      })
    )

    candles.forEach(candle => {
      candle.tf = timeframe
      candle.symbol = symbol
    })

    return candles
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
