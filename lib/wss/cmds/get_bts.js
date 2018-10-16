'use strict'

const { Backtest } = require('bfx-hf-models')
const send = require('../send')

module.exports = async (dsState, ws) => {
  const bts = await Backtest
    .find({})
    .exec()

  console.log(bts.length)

  send(ws, ['data.bts', bts])

  return bts
}
