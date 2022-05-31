const { RBTree } = require('bintrees')

function compareDataPoints (a, b) {
  return a.mts - b.mts
}

/**
 * @property {number} size
 */
class Tree extends RBTree {
  constructor () {
    super(compareDataPoints)
  }

  insert (item) {
    const current = this.find(item)
    if (current) {
      current.entries.push(item)
      return
    }

    super.insert({
      mts: item.mts,
      entries: [item]
    })
  }

  shift () {
    const min = this.min()
    if (!min) {
      return null
    }

    const data = min.entries.shift()
    if (min.entries.length > 0) {
      return data
    }

    this.remove(min)
    return data
  }
}

module.exports = Tree
