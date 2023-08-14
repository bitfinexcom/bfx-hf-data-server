'use strict'

const { setBtFavorite } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, executionId, isFavorite] = msg

  await setBtFavorite(executionId, isFavorite)
  send(ws, ['data.bt.history.favorite', { executionId, isFavorite }])
}
