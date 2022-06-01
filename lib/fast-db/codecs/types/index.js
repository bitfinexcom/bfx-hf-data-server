/**
 * @typedef {Object} TypeCodec
 * @property {number} size
 * @property {function(buf: Buffer, offset: number, value: any)} encode
 * @property {function(buf: Buffer, offset: number)} decode
 */

module.exports = {
  int: require('./int'),
  double: require('./double')
}
