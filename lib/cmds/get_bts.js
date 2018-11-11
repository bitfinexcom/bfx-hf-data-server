'use strict'

const { Backtest } = require('bfx-hf-models')
const send = require('../wss/send')

module.exports = async (ds, ws) => {
  const bts = await Backtest
    .find({})
    .exec()

  send(ws, ['data.bts', bts])
}
