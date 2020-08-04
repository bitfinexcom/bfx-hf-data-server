'use strict'

/**
 * Backtest parameters
 *
 * @typedef {object} BacktestParameters
 * @property {string} exchange - exchange ID, i.e. `'bitfinex'`
 * @property {string} symbol - backtest symbol, i.e. `'tBTCUSD'`
 * @property {string} tf - candle timeframe, i.e. `'1h'`
 * @property {number} start - start timestamp
 * @property {number} end - end timestamp
 * @property {boolean} includeTrades - enables trade data in backtest
 * @property {boolean} includeCandles - enables candle data in backtest
 * @property {boolean} sync - if true, missing data is synced from Bitfinex
 */
