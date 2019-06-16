'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')
require('dotenv').config()

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')

const DataServer = require('../lib/server')

const { DB_FILENAME } = process.env
const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: `${__dirname}/../${DB_FILENAME}`,
    schema: HFDBBitfinexSchema
  })
})

new DataServer({
  port: 8899,
  db,
})
