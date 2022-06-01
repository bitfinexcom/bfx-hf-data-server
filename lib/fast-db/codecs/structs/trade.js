const Struct = require('../struct')
const { int, double } = require('../types')

module.exports = new Struct({
  id: int,
  mts: int,
  amount: double,
  price: double
})
