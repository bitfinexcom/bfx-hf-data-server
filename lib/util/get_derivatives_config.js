'use strict'

const { RESTv2 } = require('bfx-api-node-rest')
const _ = require('lodash')
const BN = require('bignumber.js')
const TRADING_PAIR_PREFIX = 't'

const getFuturesPairs = _.memoize(async () => {
  const rest = new RESTv2({ transform: true })

  const [pairsList, pairsInfo] = await rest.conf({
    keys: [
      'pub:list:pair:futures',
      'pub:info:pair:futures'
    ]
  })

  const futuresPairs = {}
  pairsInfo.forEach(([pair, [,,,,,,,, initialMargin]]) => {
    if (pairsList.includes(pair)) {
      const pairSymbol = TRADING_PAIR_PREFIX + pair
      futuresPairs[pairSymbol] = { maxLeverage: new BN(1).dividedBy(initialMargin).toNumber() }
    }
  })

  // ex: {tBTCF0:USTF0': { maxLeverage: 100 }, ...}
  return futuresPairs
})

module.exports = async (symbol) => {
  const futuresPairs = await getFuturesPairs()
  return futuresPairs[symbol]
}
