'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:submit-bt')
const { Backtest } = require('bfx-hf-models')

module.exports = async (ds, ws, msg) => {
  const [
    id, indicators, trades, symbol, tf, from, to
  ] = msg[1]

  const dupCheck = await Backtest
    .findOne({ bt_id: id })
    .exec()

  // TODO: Add sendWSError() helper
  if (dupCheck) {
    debug('tried to create duplicate bt: %s', id)
    return
  }

  const bt = await Backtest.create({
    bt_id: id,
    indicators: indicators,
    trades: trades,
    from,
    to,
    symbol,
    tf,
  })

  debug('created backtest %s', id)

  return bt
}
