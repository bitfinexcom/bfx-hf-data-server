const Struct = require('./struct')
const { int, double } = require('./types')

module.exports = new Struct({
  mts: int,
  open: double,
  close: double,
  high: double,
  low: double,
  volume: double
})
