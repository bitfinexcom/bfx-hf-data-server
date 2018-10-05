'use strict'

const debug = require('debug')('hf:data-server:wss:submit_bt')
const { Backtest } = require('../../db/models')

module.exports = async (dsState, ws, msg) => {
  const [
    id, indicators, trades, symbol, tf, from, to
  ] = msg[1]

  const dupCheck = await Backtest
    .query()
    .select('*')
    .where('bt_id', id)

  // TODO: Add sendWSError() helper
  if (dupCheck.length > 0) {
    debug('tried to create duplicate bt: %s', id)
    return
  }

  const bt = await Backtest
    .query()
    .insert({
      bt_id: id,
      indicators: JSON.stringify(indicators),
      trades: JSON.stringify(trades),
      from,
      to,
      symbol,
      tf,
    })

  debug('created backtest %s', id)

  return bt
}
