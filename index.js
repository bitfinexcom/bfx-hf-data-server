'use strict'

/**
 * The HF data server exposes a websocket interface for querying trade/candle
 * data from Bitfinex, and syncronizes that data in a local DB.
 *
 * The DB backend is implemented by a plugin, currently the following are
 * available:
 * * {@link external:bfx-hf-models-adapter-sql}
 * * {@link external:bfx-hf-models-adapter-lowdb}
 *
 * Regardless of the backend, a schema must be specified (providing
 * exchange-specific API methods). The official Bitfinex schema is
 * {@link external:bfx-hf-ext-plugin-bitfinex}
 *
 * @module bfx-hf-data-server
 * @license Apache-2.0
 * @example <caption>lowdb-backed server</caption>
 * require('dotenv').config()
 *
 * const HFDB = require('bfx-hf-models')
 * const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
 * const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
 * const HFDataServer = require('bfx-hf-data-server')
 *
 * const { DB_FILENAME } = process.env
 *
 * const db = new HFDB({
 *   schema: HFDBBitfinexSchema,
 *   adapter: HFDBLowDBAdapter({
 *     dbPath: `${__dirname}/../${DB_FILENAME}`,
 *     schema: HFDBBitfinexSchema
 *   })
 * })
 *
 * const ds = new HFDataServer({
 *   port: 8899,
 *   db
 * })
 *
 * ds.open()
 *
 * @example <caption>sql-backed server</caption>
 * require('dotenv').config()
 *
 * const HFDB = require('bfx-hf-models')
 * const HFDBSQLAdapter = require('bfx-hf-models-adapter-sql')
 * const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
 * const HFDataServer = require('bfx-hf-data-server')
 *
 * const { PSQL_CONNECTION } = process.env
 *
 * const db = new HFDB({
 *   schema: HFDBBitfinexSchema,
 *   adapter: HFDBSQLAdapter({
 *     connection: PSQL_CONNECTION,
 *     clientType: 'pg'
 *   })
 * })
 *
 * const ds = new HFDataServer({
 *   port: 8899,
 *   db
 * })
 *
 * ds.open()
 */

/**
 * @external bfx-hf-models-adapter-sql
 * @see https://github.com/bitfinexcom/bfx-hf-models-adapter-sql
 */

/**
 * @external bfx-hf-models-adapter-lowdb
 * @see https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb
 */

/**
 * @external bfx-hf-ext-plugin-bitfinex
 * @see https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex
 */

module.exports = require('./lib/server')
