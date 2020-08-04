'use strict'

/**
 * @private
 *
 * @param {Array} msg - incoming backtest exec message
 * @returns {BacktestParameters} btParams
 */
const parseExecMsg = (msg = []) => {
  const [
    exchange, start, end, symbol, tf, includeCandles, includeTrades,
    sync = true, meta
  ] = msg[1] || []

  return {
    exchange, start, end, symbol, tf, includeCandles, includeTrades, sync, meta
  }
}

module.exports = parseExecMsg
