'use strict'

const { deleteBt } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, executionId] = msg

  await deleteBt(executionId)
  send(ws, ['data.bt.history.deleted', executionId])
}
