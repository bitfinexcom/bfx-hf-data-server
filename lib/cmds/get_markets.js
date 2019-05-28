'use strict'

const _toUpper = require('lodash/toUpper')
const { TIME_FRAMES } = require('bfx-hf-util')
const send = require('../wss/send')

module.exports = async (dsState, ws) => {
  const { rest } = dsState
  const symbolsRaw = await rest.symbols()
  const symbols = symbolsRaw.map(sym => `t${_toUpper(sym)}`)
  const timeframes = Object.values(TIME_FRAMES)

  send(ws, ['data.markets', symbols, timeframes])
}
