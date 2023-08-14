'use strict'

const debug = require('debug')('bfx:hf:data-server:db:sqlite_db')
const Sqlite = require('bfx-facs-db-sqlite')
let sqliteDb

// connect to db
const connectDb = async (sqlitePath) => {
  const opts = { name: 'hf_ds', label: '', dbPathAbsolute: sqlitePath }
  const sqlite = new Sqlite(this, opts, {})

  return new Promise((resolve, reject) => {
    sqlite.start(async () => {
      if (!sqlite.db) reject(new Error('sqlite connection failed'))

      debug('sqlite connected')
      sqliteDb = sqlite.db
      // create tables after db connected
      await createTables()

      resolve(true)
    })
  })
}

const createTables = async () => {
  const createBTHistory = 'create table if not exists bt_history (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, exchange VARCHAR(20), strategyId VARCHAR(50), start INTEGER, end INTEGER, symbol VARCHAR(20), timeframe VARCHAR(10), includeCandles TINYINT(1), includeTrades TINYINT(1), candleSeed INTEGER, sync TINYINT(1), executionId VARCHAR(50), capitalAllocation DOUBLE, stopLossPerc DOUBLE, maxDrawdownPerc DOUBLE, isFavorite TINYINT(1), timestamp INTEGER, btResult TEXT)'
  await executeQuery(createBTHistory)
}

const createData = async (query, values = []) => {
  await executeQuery(query, values)
}

const executeQuery = async (query, values = []) => {
  if (!sqliteDb) return

  return new Promise((resolve, reject) => {
    sqliteDb.run(query, values, (err, data) => _handleDbCallback(err, data, resolve, reject))
  })
}

const getData = async (query, values = []) => {
  if (!sqliteDb) return

  return new Promise((resolve, reject) => {
    sqliteDb.get(query, values, (err, data) => _handleDbCallback(err, data, resolve, reject))
  })
}

const queryData = async (query, values = []) => {
  if (!sqliteDb) return

  return new Promise((resolve, reject) => {
    sqliteDb.all(query, values, (err, data) => _handleDbCallback(err, data, resolve, reject))
  })
}

const _handleDbCallback = (error, data, resolve, reject) => {
  if (error) {
    console.error(error)
    reject(new Error(error.toString()))
  }
  resolve(data)
}

module.exports = { connectDb, executeQuery, createData, getData, queryData }
