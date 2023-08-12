/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const os = require('os')
const fs = require('fs')
const sqliteDb = require('../../../lib/db/sqlite_db')

const testSqlitePath = `${os.homedir()}/.bitfinexhoney/testsqlite`
const testBtValues = ['bitfinex', '123456', 1691491641045, 1691577141045, 'TESTBTC:TESTUSDT', '5m',
  true, false, 10, true, 'd80adf68-f672-4f78-a111-5d72585a2c43', 13, 56, 76, 0, Date.now()]

describe('Sqlite DB', () => {
  before(async () => {
    if (!fs.existsSync(testSqlitePath)) {
      fs.mkdirSync(testSqlitePath)
    }
    await sqliteDb.connectDb(testSqlitePath)
  })

  after(() => {
    if (fs.existsSync(testSqlitePath)) {
      fs.rmSync(testSqlitePath, { recursive: true, force: true })
    }
  })

  describe('#createData', () => {
    it('adds new entry in bt_history table', async () => {
      const createQuery = 'insert into bt_history (exchange, strategyId, start, end, symbol, timeframe, includeCandles, includeTrades, candleSeed, sync, meta, capitalAllocation, stopLossPerc, maxDrawdownPerc, isFavorite, timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      await sqliteDb.createData(createQuery, testBtValues)
      const getQuery = 'SELECT * FROM bt_history'
      const data = await sqliteDb.queryData(getQuery)
      expect(data).to.be.an('array')
      expect(data.length).to.be.greaterThan(0)
    })
  })

  describe('#getData', () => {
    it('gets data by id from bt_history table', async () => {
      const strategyId = '123456'
      const getQuery = 'SELECT * FROM bt_history where strategyId=?'
      const data = await sqliteDb.getData(getQuery, [strategyId])
      expect(data).to.be.an('object')
      expect(data.strategyId).to.be.equal(strategyId)
    })
  })

  describe('#queryData', () => {
    it('gets data rows by query from bt_history table', async () => {
      const getQuery = 'SELECT * FROM bt_history'
      const data = await sqliteDb.queryData(getQuery)
      expect(data).to.be.an('array')
      expect(data.length).to.be.greaterThan(0)
    })
  })

  describe('#executeQuery', () => {
    it('executes query to update data in bt_history table', async () => {
      const id = 1
      const isFavorite = 1
      const query = 'update bt_history set isFavorite=? where id=?'
      const values = [isFavorite, id]
      await sqliteDb.executeQuery(query, values)

      const getQuery = 'SELECT * FROM bt_history where id=?'
      const data = await sqliteDb.getData(getQuery, [id])
      expect(data.id).to.be.equal(id)
      expect(data.isFavorite).to.be.equal(isFavorite)
    })
  })
})
