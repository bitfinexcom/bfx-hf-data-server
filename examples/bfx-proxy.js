'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:data-server:examples:server')
const { connectDB, startDB } = require('bfx-hf-models')
const DataServer = require('../lib/server')

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-data-server')

  const ds = new DataServer({
    proxy: true,
    transform: true,
    port: 8899
  })
}

try {
  run()
} catch (e) {
  debug(e.stack)
}
