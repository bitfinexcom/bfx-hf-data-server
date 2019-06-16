'use strict'

const send = require('../wss/send')

module.exports = async (ds, ws) => {
  const { db } = ds
  const { Backtest } = db

  const bts = await Backtest.getAll()

  send(ws, ['data.bts', bts])
}
