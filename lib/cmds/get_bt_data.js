'use strict'

const { getBtData } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, id] = msg
  const btData = await getBtData(id)

  send(ws, ['data.bt.history.details', btData])
}
