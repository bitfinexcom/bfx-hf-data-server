'use strict'

const { deleteAllBts } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, strategyId] = msg

  await deleteAllBts(strategyId)
  send(ws, ['data.bt.history.all.deleted', strategyId])
}
