'use strict'

const debug = require('debug')('hf:data-server:db:audit')
const { BFXTrade, BFXCandle } = require('./models')
const PI = require('p-iteration')

/**
 * Checks for data consistency in all tables, exits on error
 *
 * @param {Object} ds - data server state
 * @param {string[]} ds.symbols
 * @param {string[]} ds.timeframes
 * @return {Promise} p
 */
module.exports = async ({
  symbols = [],
  timeframes = []
} = {}) => {
  debug('auditing db...')

  await PI.forEach(symbols, async (symbol) => {
    const auditArgs = {
      to: Date.now(),
      from: 0,
      symbol
    }

    await BFXTrade.auditConsistency(auditArgs) // stub
    await PI.forEach(timeframes, async (tf) => {
      await BFXCandle.auditConsistency({ ...auditArgs, tf })
    })
  })

  debug('audit OK')
}
