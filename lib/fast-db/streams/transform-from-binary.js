const { Transform } = require('stream')

class TransformFromBinary extends Transform {
  /**
   * @param {Codec} codec
   */
  constructor (codec) {
    super({ objectMode: true })
    this.codec = codec
    this.size = codec.struct.size
    this.remaining = null
  }

  _transform (chunk, encoding, callback) {
    // remaining bytes from previous chunk
    if (this.remaining) {
      chunk = Buffer.concat([this.remaining, chunk], this.remaining.length + chunk.length)
      this.remaining = null
    }

    const n = Math.floor(chunk.length / this.size)

    // if there is no exact number of items inside the chunk we should store for the next iteration
    if ((chunk.length % this.size) !== 0) {
      this.remaining = chunk.slice(n * this.size)
    }

    for (let i = 0; i < n; i++) {
      const offset = i * this.size
      const decoded = this.codec.decode(chunk, offset)

      this.push(decoded)
    }

    callback()
  }
}

module.exports = TransformFromBinary
