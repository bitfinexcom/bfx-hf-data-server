const sqliteDb = require('./sqlite_db')

const saveBt = async (args, btResult) => {
  const [
    exchange, strategyId, start, end, symbol, timeframe,
    includeCandles, includeTrades, candleSeed, sync = true, , executionId,
    { capitalAllocation, stopLossPerc, maxDrawdownPerc }
  ] = args

  const isFavorite = 0
  const timestamp = Date.now()

  const query = 'insert into bt_history (exchange, strategyId, start, end, symbol, timeframe, includeCandles, includeTrades, candleSeed, sync, executionId, capitalAllocation, stopLossPerc, maxDrawdownPerc, isFavorite, timestamp, btResult) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  const values = [
    exchange, strategyId, start, end, symbol, timeframe,
    includeCandles, includeTrades, candleSeed, sync, executionId,
    capitalAllocation, stopLossPerc, maxDrawdownPerc,
    isFavorite, timestamp, JSON.stringify(btResult)
  ]

  await sqliteDb.createData(query, values)
}

const getBtHistory = async (strategyId) => {
  const query = 'SELECT executionId, timestamp, isFavorite FROM bt_history where strategyId=?'
  const values = [strategyId]

  return await sqliteDb.queryData(query, values)
}

const getBtData = async (executionId) => {
  const query = 'SELECT * FROM bt_history where executionId=?'
  const values = [executionId]

  const btData = await sqliteDb.getData(query, values)
  const parsedResult = btData?.btResult ? JSON.parse(btData.btResult) : {}

  return { ...btData, btResult: parsedResult }
}

const setBtFavorite = async (executionId, isFavorite) => {
  const query = 'update bt_history set isFavorite=? where executionId=?'
  const values = [isFavorite, executionId]
  await sqliteDb.executeQuery(query, values)
}

const deleteBt = async (executionId) => {
  const query = 'delete from bt_history where executionId=?'
  const values = [executionId]
  await sqliteDb.executeQuery(query, values)
}

const deleteAllBts = async (strategyId) => {
  const query = 'delete from bt_history where strategyId=?'
  const values = [strategyId]
  await sqliteDb.executeQuery(query, values)
}

module.exports = { saveBt, getBtHistory, getBtData, setBtFavorite, deleteBt, deleteAllBts }
