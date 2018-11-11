'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:data-server:examples:server')
const { connectDB, startDB } = require('bfx-hf-models')

const logDataDBInfo = require('../lib/db/log_info')
const DataServer = require('../lib/server')

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-data-server')
  await logDataDBInfo()

  const ds = new DataServer({ port: 8899 })
}

try {
  run()
} catch (e) {
  debug(e.stack)
}
