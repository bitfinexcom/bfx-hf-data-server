## Bitfinex Honey Framework Data Server for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-data-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-data-server)

The HF data server exposes a websocket interface for querying trade/candle data from Bitfinex, and syncronizes that data in a local DB.

The DB backend is implemented by a plugin, currently the following are available:
* [bfx-hf-models-adapter-sql](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql)
* [bfx-hf-models-adapter-lowdb](https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb)

Regardless of the backend, a schema must be specified (providing exchange-specific API methods). The official Bitfinex schema is [bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql).

### Installation

For standalone usage:
```bash
git clone https://github.com/bitfinexcom/bfx-hf-data-server
cd bfx-hf-data-server
npm i

cp .env.example .env

npm run start-lowdb
```

For usage/extension within an existing project:
```bash
npm i --save bfx-hf-data-server
```

### Quickstart

Follow the installation instructions, and run either `npm run start-lowdb` or `npm run start-sql` depending on your selected DB backend. Be sure the required `DB_FILENAME` or `PSQL_CONNECTION` strings are present in `.env` (see `.env.example`).

### Docs

[See `docs/ws_api.md`](/docs/ws_api.md) for WebSocket API commands/packets, and [`docs/server.md`](/docs/server.md) for JSDoc-generated server class API docmentation.

For executable examples, [refer to `examples/`](/examples)

### Example

```js
const DataServer = require('bfx-hf-data-server')
const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: './SOME_DB_PATH.json',
    schema: HFDBBitfinexSchema
  })
})

const ds = new DataServer({
  port: 8899,
  db
})

ds.open()

// data server ready to receive commands
```

### Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
