/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { expect } = require('chai')

const TradeCodec = require('../../../../lib/fast-db/codecs/trade')
const Struct = require('../../../../lib/fast-db/codecs/struct')

describe('Trade Codec', () => {
  const id = 388063448
  const mts = 1567526214876
  const amount = -1.918524
  const price = 10682
  const trade = [id, mts, amount, price]

  it('encodes and decodes', () => {
    const buf = Struct.alloc(TradeCodec)

    TradeCodec.encode(buf, trade)

    const decoded = TradeCodec.decode(buf)
    expect(decoded).to.eql({
      id,
      mts,
      amount,
      price
    })
  })
})
