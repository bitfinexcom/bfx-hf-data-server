## HF Data Server

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-data-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-data-server)

The HF data server exposes a websocket interface for querying trade/candle data from Bitfinex, and syncronizes that data in a local DB.

To run, use `npm start`

## Initialization

Start a data server instance using `lib/start`:

```js
const { RESTv2 } = require('bfx-api-node-rest')
const { logDataDBInfo, startDataServer } = require('bfx-hf-data-server')

const run = async () => {
  const rest = new RESTv2(...) // create a REST API interface for fetching data
  const ds = startDataServer({
    port: 8899, // command port number
    rest
  })

  await logDataDBInfo()
}

try {
  run()
} catch (e) {
  debug(e.stack)
}
```

Then connect to the command port number (`8899` in the above example) and request a backtest by sending an 'exec.bt' command:

```js
['exec.bt', [
  from,      // start timestamp
  to,        // end timestamp
  symbol,    // i.e. 'tBTCUSD'
  timeFrame, // i.e. '1m'
  candles,   // true or false
  trades,    // true or false
  candleFields, // '*' (which candle data fields to return)
  tradeFields,  // '*' (see above)
  sync       // true or false, whether to sync missing data
]]
```

If not all requested data is available locally, the server will first syncronize it before initiating the backtest data stream. In all, the server will reply with any of the following packets:

* `['bt.sync.start', symbol, timeFrame, from, to]` - when a sync process starts
* `['bt.sync.end', symbol, timeFrame, from, to]` - when a sync process end
* `['bt.start', null, null, from, to, null, nTrades, nCandles]` - before the backtest data stream
* `['bt.end', null, null, from, to]` - after the backtest data stream
* `['bt.candle', null, null, candle]` - individual BT candle
* `['bt.trade', null, trade]` - individual BT trade

Candles are of the form `{ symbol, open, high, low, close, mts }`, and trades `{ id, symbol, amount, price }`.
