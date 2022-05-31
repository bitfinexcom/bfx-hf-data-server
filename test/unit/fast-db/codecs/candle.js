/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { expect } = require('chai')

const CandleCodec = require('../../../../lib/fast-db/codecs/candle')
const Struct = require('../../../../lib/fast-db/codecs/struct')

describe('Candle Codec', () => {
  const mts = 1567681680000
  const open = 10642
  const close = 10641
  const high = 10642
  const low = 10640
  const volume = 3.49421483
  const candles = [
    [mts, open, close, high, low, volume],
    [mts, open, close, high, low, volume],
    [mts, open, close, high, low, volume]
  ]

  it('encodes and decodes', () => {
    const buf = Struct.allocMany(CandleCodec, candles.length)

    CandleCodec.encodeMany(buf, candles)

    let offset = 0
    for (let i = 0; i < candles.length; i++) {
      const decoded = CandleCodec.decode(buf, offset)
      offset += CandleCodec.size
      expect(decoded).to.eql({
        mts,
        open,
        close,
        high,
        low,
        volume
      })
    }
  })
})
