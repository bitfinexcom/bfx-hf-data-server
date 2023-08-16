/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const proxyquire = require('proxyquire')
const sinon = require('sinon')
const { expect } = require('chai')
let btDao
const testBt = {
  exchange: 'bitfinex',
  strategyId: '123456',
  start: 1691491641045,
  end: 1691577141045,
  symbol: 'TESTBTC:TESTUSD',
  timeframe: '5m',
  includeCandles: true,
  includeTrades: false,
  candleSeed: 10,
  sync: true,
  executionId: 'd80adf68-f672-4f78-a111-5d72585a2c43',
  capitalAllocation: 13,
  stopLossPerc: 56,
  maxDrawdownPerc: 76,
  isFavorite: 0,
  timestamp: Date.now()
}

describe('Backtest DAO', () => {
  const executeQueryStub = sinon.stub()
  const createDataStub = sinon.stub()
  const getDataStub = sinon.stub()
  const queryDataStub = sinon.stub()

  before(() => {
    getDataStub.returns(testBt)
    queryDataStub.returns([testBt])

    btDao = proxyquire('../../../lib/db/bt_dao',
      {
        './sqlite_db': {
          executeQuery: executeQueryStub,
          createData: createDataStub,
          getData: getDataStub,
          queryData: queryDataStub
        }
      })
  })

  describe('#saveBt', () => {
    it('save backtest', async () => {
      const args = [
        'bitfinex', '123456', 1691491641045, 1691577141045, 'TESTBTC:TESTUSD',
        '5m', true, false, 10, true, {}, 'd80adf68-f672-4f78-a111-5d72585a2c43',
        { capitalAllocation: 13, stopLossPerc: 56, maxDrawdownPerc: 76 }
      ]
      await btDao.saveBt(args)
      expect(createDataStub.calledOnce).to.be.true
    })
  })

  describe('#getBtHistory', () => {
    it('get backtest history for a strategy', async () => {
      const strategyId = '123456'
      const data = await btDao.getBtHistory(strategyId)
      expect(data).to.be.an('array')
      expect(data.length).to.be.greaterThan(0)
      expect(queryDataStub.calledOnce).to.be.true
    })
  })

  describe('#setBtFavorite', () => {
    it('sets backtest as favorite', async () => {
      const executionId = testBt.executionId
      const isFavorite = 1
      await btDao.setBtFavorite(executionId, isFavorite)
      expect(executeQueryStub.calledOnce).to.be.true
    })
  })
})
