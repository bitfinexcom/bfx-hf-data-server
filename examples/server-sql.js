'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')
require('dotenv').config()

const HFDB = require('bfx-hf-models')
const HFDBSQLAdapter = require('bfx-hf-models-adapter-sql')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
const DataServer = require('../lib/server')

const { PSQL_CONNECTION } = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBSQLAdapter({
    connection: PSQL_CONNECTION,
    clientType: 'pg'
  })
})

const ds = new DataServer({
  port: 8899,
  db
})

ds.open()
