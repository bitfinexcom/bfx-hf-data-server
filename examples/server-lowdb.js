'use strict'

const path = require('path')

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')
require('dotenv').config()

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
const DataServer = require('../lib/server')

const { DB_FILENAME = 'test-db.json' } = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: path.join(__dirname, '..', DB_FILENAME),
    schema: HFDBBitfinexSchema
  })
})

const ds = new DataServer({
  rest_base_url: 'http://localhost:3001/bitfinex',
  port: 8899,
  db
})

ds.open()
