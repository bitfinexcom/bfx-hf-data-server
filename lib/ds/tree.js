class Node {
  constructor (data) {
    this.data = [data]
    this.mts = data.mts
    this.left = null
    this.right = null
  }

  append (data) {
    this.data.push(data)
  }
}

class Tree {
  constructor () {
    this.root = null
  }

  insert (dataPoint) {
    const mts = dataPoint.mts
    const node = new Node(dataPoint)

    if (this.root === null) {
      this.root = node
      return
    }

    let parent = this.root
    while (parent) {
      if (parent.mts === mts) {
        parent.append(dataPoint)
        return
      }

      if (node.mts > parent.mts) {
        if (parent.right) {
          parent = parent.right
          continue
        }

        parent.right = node
        return
      }

      if (parent.left) {
        parent = parent.left
        continue
      }

      parent.left = node
      return
    }
  }

  isEmpty () {
    return this.root === null
  }

  shift () {
    if (!this.root) {
      return null
    }

    const parent = this.root
    const data = parent.data.shift()

    if (parent.data.length > 0) {
      return data
    }

    if (parent.left && parent.right) {
      return data
    }

    if (parent.left) {
      return data
    }

    if (parent.right) {
      return data
    }

    this.root = null
    return data
  }
}

module.exports = Tree
