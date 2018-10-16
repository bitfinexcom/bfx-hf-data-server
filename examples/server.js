'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:data-server:examples:server')
const bfx = require('./bfx')
const { connectDB, startDB } = require('bfx-hf-models')

const logDataDBInfo = require('../lib/db/log_info')
const startDataServer = require('../lib/start')

const rest = bfx.rest(2, { transform: true })

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-data-server')
  await logDataDBInfo()

  const ds = startDataServer({
    port: 8899,
    rest
  })
}

try {
  run()
} catch (e) {
  debug(e.stack)
}
