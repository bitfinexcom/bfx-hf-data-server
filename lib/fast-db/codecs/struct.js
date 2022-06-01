class Struct {
  /**
   * @param {Object<string, TypeCodec>} fields
   */
  constructor (fields) {
    this.fields = Object.entries(fields)
      .map(([name, type]) => ({ name, type }))
    this.size = this.sizeOf()
  }

  sizeOf () {
    return this.fields.reduce((size, field) => size + field.type.size, 0)
  }
}

module.exports = Struct
