## Modules

<dl>
<dt><a href="#module_bfx-hf-data-server">bfx-hf-data-server</a></dt>
<dd><p>The HF data server exposes a websocket interface for querying trade/candle
data from Bitfinex, and syncronizes that data in a local DB.</p>
<p>The DB backend is implemented by a plugin, currently the following are
available:</p>
<ul>
<li><a href="https://github.com/bitfinexcom/bfx-hf-models-adapter-sql">bfx-hf-models-adapter-sql</a></li>
<li><a href="https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb">bfx-hf-models-adapter-lowdb</a></li>
</ul>
<p>Regardless of the backend, a schema must be specified (providing
exchange-specific API methods). The official Bitfinex schema is
<a href="https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex">bfx-hf-ext-plugin-bitfinex</a></p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#HFDataServer">HFDataServer</a></dt>
<dd><p>Honey Framework Data Server</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#BacktestParameters">BacktestParameters</a> : <code>object</code></dt>
<dd><p>Backtest parameters</p>
</dd>
</dl>

<a name="module_bfx-hf-data-server"></a>

## bfx-hf-data-server
The HF data server exposes a websocket interface for querying trade/candle
data from Bitfinex, and syncronizes that data in a local DB.

The DB backend is implemented by a plugin, currently the following are
available:
* [bfx-hf-models-adapter-sql](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql)
* [bfx-hf-models-adapter-lowdb](https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb)

Regardless of the backend, a schema must be specified (providing
exchange-specific API methods). The official Bitfinex schema is
[bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex)

**License**: Apache-2.0  
**Example** *(lowdb-backed server)*  
```js
require('dotenv').config()

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
const HFDataServer = require('bfx-hf-data-server')

const { DB_FILENAME } = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: `${__dirname}/../${DB_FILENAME}`,
    schema: HFDBBitfinexSchema
  })
})

const ds = new HFDataServer({
  port: 8899,
  db
})

ds.open()
```
**Example** *(sql-backed server)*  
```js
require('dotenv').config()

const HFDB = require('bfx-hf-models')
const HFDBSQLAdapter = require('bfx-hf-models-adapter-sql')
const { schema: HFDBBitfinexSchema } = require('bfx-hf-ext-plugin-bitfinex')
const HFDataServer = require('bfx-hf-data-server')

const { PSQL_CONNECTION } = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBSQLAdapter({
    connection: PSQL_CONNECTION,
    clientType: 'pg'
  })
})

const ds = new HFDataServer({
  port: 8899,
  db
})

ds.open()
```
<a name="HFDataServer"></a>

## HFDataServer
Honey Framework Data Server

**Kind**: global class  

* [HFDataServer](#HFDataServer)
    * [new HFDataServer(args)](#new_HFDataServer_new)
    * [.open()](#HFDataServer+open)
    * [.close()](#HFDataServer+close)
    * [.getRunningSyncRanges()](#HFDataServer+getRunningSyncRanges) ⇒ <code>Array.&lt;object&gt;</code>
    * [.isSyncActive(range)](#HFDataServer+isSyncActive) ⇒ <code>boolean</code>

<a name="new_HFDataServer_new"></a>

### new HFDataServer(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | arguments |
| args.db | <code>object</code> | bfx-hf-models DB instance |
| [args.apiKey] | <code>string</code> | for bfx proxy |
| [args.apiSecret] | <code>string</code> | for bfx proxy |
| [args.agent] | <code>object</code> | proxy agent for bfx proxy connection |
| [args.wsURL] | <code>string</code> | bitfinex websocket API URL |
| [args.restURL] | <code>string</code> | bitfinex RESTv2 API URL |
| [args.transform] | <code>boolean</code> | for bfx proxy |
| [args.proxy] | <code>boolean</code> | if true, a bfx proxy will be opened for   every client |
| args.port | <code>number</code> | websocket server port |

<a name="HFDataServer+open"></a>

### hfDataServer.open()
Spawns the WebSocket API server; throws an error if it is already open

**Kind**: instance method of [<code>HFDataServer</code>](#HFDataServer)  
<a name="HFDataServer+close"></a>

### hfDataServer.close()
Closes the WebSocket API server; throws an error if it is not open

**Kind**: instance method of [<code>HFDataServer</code>](#HFDataServer)  
<a name="HFDataServer+getRunningSyncRanges"></a>

### hfDataServer.getRunningSyncRanges() ⇒ <code>Array.&lt;object&gt;</code>
Returns an array of active sync ranges

**Kind**: instance method of [<code>HFDataServer</code>](#HFDataServer)  
**Returns**: <code>Array.&lt;object&gt;</code> - ranges  
<a name="HFDataServer+isSyncActive"></a>

### hfDataServer.isSyncActive(range) ⇒ <code>boolean</code>
Queries if an active sync exists covering the specified range

**Kind**: instance method of [<code>HFDataServer</code>](#HFDataServer)  
**Returns**: <code>boolean</code> - isActive  

| Param | Type | Description |
| --- | --- | --- |
| range | <code>object</code> | range |
| range.start | <code>number</code> | start timestamp |
| range.end | <code>number</code> | end timestamp |
| range.exchange | <code>string</code> | exchange ID |
| range.symbol | <code>string</code> | symbol |
| range.tf | <code>string</code> | timeframe |

<a name="BacktestParameters"></a>

## BacktestParameters : <code>object</code>
Backtest parameters

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| exchange | <code>string</code> | exchange ID, i.e. `'bitfinex'` |
| symbol | <code>string</code> | backtest symbol, i.e. `'tBTCUSD'` |
| tf | <code>string</code> | candle timeframe, i.e. `'1h'` |
| start | <code>number</code> | start timestamp |
| end | <code>number</code> | end timestamp |
| includeTrades | <code>boolean</code> | enables trade data in backtest |
| includeCandles | <code>boolean</code> | enables candle data in backtest |
| sync | <code>boolean</code> | if true, missing data is synced from Bitfinex |

