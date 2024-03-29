'use strict'

const { getBtHistory } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, strategyId] = msg
  const btHistory = await getBtHistory(strategyId)

  send(ws, ['data.bt.history.list', strategyId, btHistory])
}
