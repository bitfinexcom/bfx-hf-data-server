'use strict'

/**
 * The HF data server exposes a websocket interface for querying trade/candle
 * data from Bitfinex, and syncronizes that data in a local DB.
 *
 * The DB backend is implemented by a plugin, currently the following are available:
 * * {@link module:bfx-hf-models-adapter-sql|bfx-hf-models-adapter-sql}
 * * {@link module:bfx-hf-models-adapter-lowdb|bfx-hf-models-adapter-lowdb}
 *
 * Regardless of the backend, a schema must be specified (providing
 * exchange-specific API methods). The official Bitfinex schema is
 * {@link module:bfx-hf-ext-plugin-bitfinex|bfx-hf-ext-plugin-bitfinex}
 *
 * ### Installation
 *
 * For standalone usage:
 *
 * ```bash
 * git clone https://github.com/bitfinexcom/bfx-hf-data-server
 * cd bfx-hf-data-server
 * npm i
 *
 * cp .env.example .env
 *
 * npm run start-lowdb
 * ```
 *
 * For usage/extension within an existing project:
 *
 * ```bash
 * npm i --save bfx-hf-data-server
 * ```
 *
 * ### Quickstart
 *
 * Follow the installation instructions, and run either `npm run start-lowdb`
 * or `npm run start-sql` depending on your selected DB backend. Be sure the
 * required `DB_FILENAME` or `PSQL_CONNECTION` strings are present in `.env`
 * (see `.env.example`).
 *
 * @module bfx-hf-data-server
 * @license Apache-2.0
 */

module.exports = require('./lib/server')
