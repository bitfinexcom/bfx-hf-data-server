const sizeOfStruct = (fields) => {
  let size = 0
  for (const type of Object.values(fields)) {
    size += type.size
  }
  return size
}

class Struct {
  constructor (fields) {
    this.fields = fields
    this.fieldsList = Object.values(fields)
    this.size = sizeOfStruct(this.fieldsList)
  }

  encode (buffer, data, offset = 0) {
    if (data.length !== this.fieldsList.length) {
      throw new Error('Invalid data length')
    }

    for (let i = 0; i < data.length; i++) {
      const type = this.fieldsList[i]
      const value = data[i]

      type.encode(buffer, offset, value)
      offset += type.size
    }
  }

  encodeMany (buffer, list, offset = 0) {
    for (const item of list) {
      this.encode(buffer, item, offset)
      offset += this.size
    }
  }

  decode (buffer, offset = 0) {
    const data = {}

    for (const [key, type] of Object.entries(this.fields)) {
      data[key] = type.decode(buffer, offset)
      offset += type.size
    }

    return data
  }

  /**
   * @param {Struct} struct
   * @return {Buffer}
   */
  static alloc (struct) {
    return Struct.allocMany(struct, 1)
  }

  /**
   * @param {Struct} struct
   * @param {number} n - number of structs to fit in buffer
   * @return {Buffer}
   */
  static allocMany (struct, n) {
    return Buffer.allocUnsafe(struct.size * n)
  }
}

module.exports = Struct
