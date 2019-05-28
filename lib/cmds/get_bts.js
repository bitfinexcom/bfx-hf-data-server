'use strict'

const db = require('../db')
const send = require('../wss/send')

const { Backtest } = db
const { getAll } = Backtest

module.exports = async (ds, ws) => {
  const bts = getAll()
  send(ws, ['data.bts', bts])
}
