const { Transform } = require('stream')

class TransformToBinary extends Transform {
  /**
   * @param {Codec} codec
   */
  constructor (codec) {
    super({ objectMode: true })
    this.codec = codec
  }

  _transform (chunk, encoding, callback) {
    const buffer = this.codec.alloc()
    this.codec.encode(buffer, chunk)

    callback(null, buffer)
  }
}

module.exports = TransformToBinary
