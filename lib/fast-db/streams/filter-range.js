const { Transform } = require('stream')

class FilterRange extends Transform {
  constructor ({ offset, limit }) {
    super({ objectMode: true })
    this.offset = offset
    this.limit = limit
  }

  _transform (chunk, encoding, callback) {
    if (chunk.mts >= this.offset && chunk.mts <= this.limit) {
      this.push(chunk)
    }
    callback()
  }
}

module.exports = FilterRange
