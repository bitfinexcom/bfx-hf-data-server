'use strict'

const { getBtHistory } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, stragegyId] = msg
  const btHistory = await getBtHistory(stragegyId)

  send(ws, ['data.bt.history.list', btHistory])
}
