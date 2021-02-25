<a name="DataServer"></a>

## DataServer
**Kind**: global class  

* [DataServer](#DataServer)
    * [new DataServer(args, db, port)](#new_DataServer_new)
    * [.open()](#DataServer+open)
    * [.close()](#DataServer+close)
    * [.getRunningSyncRanges()](#DataServer+getRunningSyncRanges) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.isSyncActive(range)](#DataServer+isSyncActive) ⇒ <code>boolean</code>
    * [.expectSync(range)](#DataServer+expectSync) ⇒ <code>Promise</code>
    * [.optimizeSyncRange(range)](#DataServer+optimizeSyncRange) ⇒ <code>Object</code>
    * [.notifySyncStart(args)](#DataServer+notifySyncStart)
    * [.notifySyncEnd(args)](#DataServer+notifySyncEnd)

<a name="new_DataServer_new"></a>

### new DataServer(args, db, port)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> |  |
| db | <code>Object</code> | bfx-hf-models DB instance |
| port | <code>number</code> | websocket server port |

<a name="DataServer+open"></a>

### dataServer.open()
Spawns the WebSocket API server; throws an error if it is already open

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
<a name="DataServer+close"></a>

### dataServer.close()
Closes the WebSocket API server; throws an error if it is not open

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
<a name="DataServer+getRunningSyncRanges"></a>

### dataServer.getRunningSyncRanges() ⇒ <code>Array.&lt;Object&gt;</code>
Returns an array of active sync ranges

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
**Returns**: <code>Array.&lt;Object&gt;</code> - ranges  
<a name="DataServer+isSyncActive"></a>

### dataServer.isSyncActive(range) ⇒ <code>boolean</code>
Queries if an active sync exists covering the specified range

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
**Returns**: <code>boolean</code> - isActive  

| Param | Type |
| --- | --- |
| range | <code>Object</code> | 
| range.start | <code>number</code> | 
| range.end | <code>number</code> | 
| range.exchange | <code>string</code> | 
| range.symbol | <code>string</code> | 
| range.tf | <code>string</code> | 

<a name="DataServer+expectSync"></a>

### dataServer.expectSync(range) ⇒ <code>Promise</code>
Returns a promise that resolves when a sync covering the specified range
finishes. If no such sync is active, this is a no-op.

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
**Returns**: <code>Promise</code> - p - resolves on sync completion  

| Param | Type |
| --- | --- |
| range | <code>Object</code> | 
| range.start | <code>number</code> | 
| range.end | <code>number</code> | 
| range.exchange | <code>string</code> | 
| range.symbol | <code>string</code> | 
| range.tf | <code>string</code> | 

<a name="DataServer+optimizeSyncRange"></a>

### dataServer.optimizeSyncRange(range) ⇒ <code>Object</code>
Returns a sync range that takes into account active syncs, to prevent
overlapping sync tasks.

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  
**Returns**: <code>Object</code> - optimalRange - null if sync not required at all  

| Param | Type |
| --- | --- |
| range | <code>Object</code> | 
| range.exchange | <code>string</code> | 
| range.symbol | <code>string</code> | 
| range.tf | <code>string</code> | 
| range.start | <code>number</code> | 
| range.end | <code>number</code> | 

<a name="DataServer+notifySyncStart"></a>

### dataServer.notifySyncStart(args)
Notify the server that a sync is running for the specified range/market

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 
| args.exchange | <code>string</code> | 
| args.symbol | <code>string</code> | 
| args.tf | <code>string</code> | 
| args.start | <code>number</code> | 
| args.end | <code>number</code> | 

<a name="DataServer+notifySyncEnd"></a>

### dataServer.notifySyncEnd(args)
Notify the server that a sync has finished for the specified range/market

**Kind**: instance method of [<code>DataServer</code>](#DataServer)  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 
| args.exchange | <code>string</code> | 
| args.symbol | <code>string</code> | 
| args.tf | <code>string</code> | 
| args.start | <code>number</code> | 
| args.end | <code>number</code> | 

