'use strict'

const { BFXCandleChunk } = require('bfx-hf-db')
const send = require('../send')

module.exports = async (dsState, ws) => {
  return BFXCandleChunk
    .query()
    .select('*')
    .then(chunks => {
      send(ws, ['data.candle_chunks', chunks])

      return chunks
    })
}
