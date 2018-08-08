'use strict'

const debug = require('debug')('hf:data-server:ws:get_bts')
const { Backtest } = require('../../db/models')
const send = require('../send')

module.exports = async (dsState, ws) => {
  return Backtest
    .query()
    .select('*')
    .then((bts) => {
      const parsedBTs = bts.map(bt => {
        let trades
        let indicators

        try {
          trades = JSON.parse(bt.trades)
        } catch (e) {
          debug('error parsing trades JSON for %s: %s', bt.id, e.message)
        }

        try {
          indicators = JSON.parse(bt.indicators)
        } catch (e) {
          debug('error parsing trades JSON for %s: %s', bt.id, e.message)
        }

        return {
          ...bt,
          trades,
          indicators
        }
      })

      send(ws, ['data.bt.all', parsedBTs])

      return parsedBTs
    })
}
