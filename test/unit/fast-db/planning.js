/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { expect } = require('chai')

const { fillTheGaps } = require('../../../lib/fast-db/planning')

describe('Planning execution', () => {
  describe('#fillTheGaps', function () {
    const framesInDisk = [
      { low: 3, high: 7 },
      { low: 20, high: 25 },
      { low: 10, high: 20 },
      { low: 32, high: 40 },
      { low: 8, high: 21 },
      { low: 68, high: 75 }
    ]

    it('should fill the gaps that needs to be loaded', () => {
      const result = fillTheGaps(framesInDisk, 1, 50)

      expect(result).to.be.eql([
        { low: 1, high: 2, pending: true },
        { low: 3, high: 7, offset: 3, limit: 7 },
        { low: 8, high: 21, offset: 8, limit: 21 },
        { low: 20, high: 25, offset: 22, limit: 25 },
        { low: 26, high: 31, pending: true },
        { low: 32, high: 40, offset: 32, limit: 40 },
        { low: 41, high: 50, pending: true }
      ])
    })
  })
})
