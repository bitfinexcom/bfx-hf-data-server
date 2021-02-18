## Bitfinex Honey Framework Data Server for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-data-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-data-server)

The HF data server runs backtests for the HF UI Electron App. It syncs candle and trade data and then executes the strategy on it for backtesting.

The DB backend is implemented by a plugin:
* [bfx-hf-models-adapter-lowdb](https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb)

Regardless of the backend, a schema must be specified (providing exchange-specific API methods). The official Bitfinex schema is [bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex).

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

Follow the installation instructions, and run `npm run start-lowdb`.

### Docs

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
