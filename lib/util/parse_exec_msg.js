'use strict'

/**
 * @memberof module:bfx-hf-data-server
 * @private
 *
 * @param {Array} msg - incoming backtest exec message
 * @returns {module:bfx-hf-data-server.BacktestParameters} btParams
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
