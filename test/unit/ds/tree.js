/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { expect } = require('chai')

const Tree = require('../../../lib/ds/tree')

describe('Tree', () => {
  const tree = new Tree()

  it('inserts data-points', () => {
    expect(tree.size).to.be.eq(0)

    tree.insert({ mts: 10, value: 1 })
    tree.insert({ mts: 10, value: 2 })
    tree.insert({ mts: 20, value: 2 })
    tree.insert({ mts: 5, value: 3 })

    expect(tree.size).to.be.eq(3)
  })

  it('retrieve data points ordered by time', () => {
    expect(tree.shift()).to.eql({ mts: 5, value: 3 })
    expect(tree.shift()).to.eql({ mts: 10, value: 1 })
    expect(tree.shift()).to.eql({ mts: 10, value: 2 })
    expect(tree.shift()).to.eql({ mts: 20, value: 2 })
    expect(tree.shift()).to.be.null
    expect(tree.size).to.be.eq(0)
  })
})
