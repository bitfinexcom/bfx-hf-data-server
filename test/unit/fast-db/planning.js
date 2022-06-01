/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { expect } = require('chai')

const { fillTheGaps } = require('../../../lib/fast-db/planning')

describe('Planning execution', () => {
  describe('#fillTheGaps', function () {
    const framesInDisk = [
      { start: 3, end: 7 },
      { start: 20, end: 25 },
      { start: 10, end: 20 },
      { start: 32, end: 40 },
      { start: 8, end: 21 },
      { start: 68, end: 75 }
    ]

    it('should fill the gaps that needs to be loaded', () => {
      const start = 1
      const end = 50
      const result = fillTheGaps(framesInDisk, start, end)

      expect(result).to.be.eql([
        { start: 1, end: 2, pending: true },
        { start: 3, end: 7, offset: 3, limit: 7 },
        { start: 8, end: 21, offset: 8, limit: 21 },
        { start: 20, end: 25, offset: 22, limit: 25 },
        { start: 26, end: 31, pending: true },
        { start: 32, end: 40, offset: 32, limit: 40 },
        { start: 41, end: 50, pending: true }
      ])
    })
  })
})
