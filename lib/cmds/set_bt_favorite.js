'use strict'

const { setBtFavorite } = require('../db/bt_dao')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, id, isFavorite] = msg

  await setBtFavorite(id, isFavorite)
  send(ws, ['data.bt.history.favorite', { id, isFavorite }])
}
