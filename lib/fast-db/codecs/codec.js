class Codec {
  /**
   * @param {Struct} struct
   */
  constructor (struct) {
    this.struct = struct
  }

  /**
   * @param {Buffer} buffer
   * @param {Array} data
   * @param {number} offset
   */
  encode (buffer, data, offset = 0) {
    if (data.length !== this.struct.fields.length) {
      throw new Error('Invalid data length')
    }

    for (let i = 0; i < data.length; i++) {
      const { type } = this.struct.fields[i]
      const value = data[i]

      type.encode(buffer, offset, value)
      offset += type.size
    }
  }

  /**
   * @param {Buffer} buffer
   * @param {Array[]} list
   * @param {number} offset
   */
  encodeMany (buffer, list, offset = 0) {
    for (const item of list) {
      this.encode(buffer, item, offset)
      offset += this.struct.size
    }
  }

  /**
   * @param {Buffer} buffer
   * @param {number} offset
   * @return {Object}
   */
  decode (buffer, offset = 0) {
    const data = {}

    for (const { name, type } of this.struct.fields) {
      data[name] = type.decode(buffer, offset)
      offset += type.size
    }

    return data
  }

  /**
   * @return {Buffer}
   */
  alloc () {
    return this.allocMany(1)
  }

  /**
   * @param {number} n - number of structs to fit in buffer
   * @return {Buffer}
   */
  allocMany (n) {
    return Buffer.allocUnsafe(this.struct.size * n)
  }
}

module.exports = Codec
