'use strict'

process.env.DEBUG = 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')
require('dotenv').config()

const DataServer = require('../lib/server')

new DataServer({ port: 8899 })
