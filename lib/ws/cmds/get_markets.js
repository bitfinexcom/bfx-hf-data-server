'use strict'

const send = require('../send')

module.exports = async (dsState, ws) => {
  const { symbols, timeframes } = dsState

  send(ws, ['data.markets', symbols, timeframes])
}
