'use strict'

const { getBtData } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, executionId] = msg
  const btData = await getBtData(executionId)

  send(ws, ['data.bt.history.details', executionId, btData])
}
