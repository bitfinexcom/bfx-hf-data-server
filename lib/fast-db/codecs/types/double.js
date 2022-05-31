module.exports = {
  size: 8,
  encode: function (buf, offset, value) {
    return buf.writeDoubleBE(value, offset)
  },
  decode: function (buf, offset) {
    return buf.readDoubleBE(offset)
  }
}
