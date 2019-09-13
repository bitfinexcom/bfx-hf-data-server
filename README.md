## HF Data Server

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-data-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-data-server)

The HF data server exposes a websocket interface for querying trade/candle data from Bitfinex, and syncronizes that data in a local DB.

The DB backend is implemented by a plugin, currently the following are available:
* [bfx-hf-models-adapter-sql](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql)
* [bfx-hf-models-adapter-lowdb](https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb)

Regardless of the backend, a schema must be specified (providing exchange-specific API methods). The official Bitfinex schema is [bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql).

To run, use `npm start-lowdb` or `npm start-sql`

## Initialization

Create a `bfx-hf-models` DB instance and pass it to the data server constructor:

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
```

Then connect to the command port number (`8899` in the above example) and request a backtest by sending an 'exec.bt' command:

```js
['exec.bt', [
  exchange,  // exchange to pull data from, requires matching adapter
  from,      // start timestamp
  to,        // end timestamp
  symbol,    // i.e. 'tBTCUSD'
  timeFrame, // i.e. '1m'
  candles,   // true or false
  trades,    // true or false
  sync       // true or false, whether to sync missing data
]]
```

If not all requested data is available locally, the server will first syncronize it before initiating the backtest data stream. In all, the server will reply with any of the following packets:

* `['data.sync.start', exchange, symbol, timeFrame, from, to, meta]` - when a sync process starts
* `['data.sync.end', exchange, symbol, timeFrame, from, to, meta]` - when a sync process end
* `['bt.start', null, null, from, to, null, nTrades, nCandles]` - before the backtest data stream
* `['bt.end', null, null, from, to]` - after the backtest data stream
* `['bt.candle', null, null, candle]` - individual BT candle
* `['bt.trade', null, trade]` - individual BT trade

Candles are of the form `{ symbol, open, high, low, close, volume, mts }`, and trades `{ id, symbol, amount, price }`.
