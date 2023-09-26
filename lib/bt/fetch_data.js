const { DEFAULT_ITEMS_LIMIT, CANDLE_FETCH_SECTION } = require('./constants')
const addMissingCandles = require('../util/add_missing_candles')

/**
 * @param {RESTv2} rest
 * @param {RequestSemaphore} semaphore
 * @param {string} symbol
 * @param {string} timeframe
 * @return {function(*, *): *}
 */
const fetchCandles = (rest, semaphore, { symbol, timeframe }) => {
  return async (offset, end, limit = DEFAULT_ITEMS_LIMIT) => {
    const candleOpts = {
      timeframe,
      symbol,
      section: CANDLE_FETCH_SECTION,
      query: {
        limit,
        start: offset,
        end,
        sort: 1
      }
    }
    const candleResponse = await semaphore.add(
      rest.candles.bind(rest, candleOpts)
    )

    // fill missing candles
    const candles = addMissingCandles(candleResponse, timeframe, candleOpts.query)

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
