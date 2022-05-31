module.exports = {
  size: 6,
  encode: function (buf, offset, value) {
    return buf.writeIntBE(value, offset, this.size)
  },
  decode: function (buf, offset) {
    return buf.readIntBE(offset, this.size)
  }
}
