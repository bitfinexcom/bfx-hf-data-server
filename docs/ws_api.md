### WebSocket API

After opening a websocket connection to a running `bfx-hf-data-server` instance, the following commands are available:

* `['exec.bt', [exchange, from, to, symbol, tf, candles, tades, sync]]`
* `['get.bts']`
* `['get.candles', exchange, symbol, tf, type, reqStart, reqEnd, meta]`
* `['get.markets']`
* `['get.trades', symbol, type, from, to]`
* `['bfx', bfxMessage]`
* `['submit.bt', [btID, strategyID, indicators, trades, symbol, tf, from, to]]`

#### `exec.bt` response packets
* `['data.sync.start', exchange, symbol, timeFrame, from, to, meta]` - when a sync process starts
* `['data.sync.end', exchange, symbol, timeFrame, from, to, meta]` - when a sync process end
* `['bt.start', null, null, from, to, null, nTrades, nCandles, meta]` - before the backtest data stream
* `['bt.end', null, null, from, to, meta]` - after the backtest data stream
* `['bt.candle', null, null, candle, meta]` - individual BT candle
* `['bt.trade', null, trade, meta]` - individual BT trade

#### `get.bts` response packets
* `['data.bts', bts]`

#### `get.candles` response packets
* `['data.sync.start', exchange, symbol, tf, from, to, meta]` - when a sync process starts
* `['data.sync.end', exchange, symbol, tf, from, to, meta]` - when a sync process end
* `['data.candles', exchange, symbol, tf, type, reqStart, reqEnd, meta, candles]`

#### `get.markets` response packets
* `['data.markets', symbols, tfs]`

#### `get.trades` response packets
* `['data.trades', symbol, from, to, trades]`

#### `submit.bt` response packets
* `['data.bt', bt]`

#### `bfx` response packets
* `['bfx', bitfinexPacket]`
