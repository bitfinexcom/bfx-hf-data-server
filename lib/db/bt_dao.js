const sqliteDb = require('./sqlite_db')

const saveBt = async (args) => {
  const [
    exchange, strategyId, start, end, symbol, timeframe,
    includeCandles, includeTrades, candleSeed, sync = true, , meta,
    { capitalAllocation, stopLossPerc, maxDrawdownPerc }
  ] = args

  const isFavorite = 0
  const timestamp = Date.now()

  const query = 'insert into bt_history (exchange, strategyId, start, end, symbol, timeframe, includeCandles, includeTrades, candleSeed, sync, meta, capitalAllocation, stopLossPerc, maxDrawdownPerc, isFavorite, timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  const values = [
    exchange, strategyId, start, end, symbol, timeframe,
    includeCandles, includeTrades, candleSeed, sync, meta,
    capitalAllocation, stopLossPerc, maxDrawdownPerc,
    isFavorite, timestamp
  ]

  await sqliteDb.createData(query, values)
}

const getBtHistory = async (stragegyId) => {
  const query = 'SELECT id, timestamp, isFavorite FROM bt_history where strategyId=?'
  const values = [stragegyId]

  return await sqliteDb.queryData(query, values)
}

const getBtData = async (id) => {
  const query = 'SELECT * FROM bt_history where id=?'
  const values = [id]

  return await sqliteDb.getData(query, values)
}

const setBtFavorite = async (id, isFavorite) => {
  const query = 'update bt_history set isFavorite=? where id=?'
  const values = [isFavorite, id]
  await sqliteDb.executeQuery(query, values)
}

module.exports = { saveBt, getBtHistory, getBtData, setBtFavorite }
