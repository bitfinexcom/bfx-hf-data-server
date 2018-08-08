'use strict'

const debug = require('debug')('hf:server:data:db:sync_ranges')
const PI = require('p-iteration')
const { BFXTrade, BFXCandle } = require('bfx-hf-db')
const { rangeString } = require('bfx-hb-util')

module.exports = async ({
  ranges = [],
  symbols = [],
  timeframes = [],
  trades = false,
  candles = true
}) => {
  await PI.forEach(ranges, async (range = {}) => {
    debug('syncing range %s', rangeString(range.start, range.end))

    await PI.forEach(symbols, async (symbol) => {
      await PI.forEach(timeframes, async (tf) => {
        if (candles) {
          await BFXCandle.syncRemoteRange(this._rest, {
            symbol,
            tf,
            from: range.start,
            to: range.end
          })
        }

        if (trades) {
          await BFXTrade.syncRemoteRange({
            symbol,
            maxDiscrepancy: 60 * 60 * 1000, // 1hr
            start: range.start,
            end: range.end,
            skipBounds: true
          })
        }
      })
    })
  })
}
