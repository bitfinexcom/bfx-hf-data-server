'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')
require('dotenv').config()

const os = require('os')
const path = require('path')

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
const DataServer = require('../lib/server')

const { DB_FILENAME = 'dbtest' } = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: path.join(__dirname, '..', DB_FILENAME),
    schema: HFDBBitfinexSchema
  })
})

const dir = `${os.homedir()}/.honeyframework`
const ds = new DataServer({
  port: 8899,
  db,
  dir
})

ds.open()
