'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:get-candles')
const send = require('../wss/send')

module.exports = async (ds, ws, msg) => {
  const [, exchange, symbol, tf, type, start, end, meta] = msg
  const { db } = ds
  const { Candle } = db

  let optimizedRange = ds.optimizeSyncRange({
    exchange,
    symbol,
    tf,
    start,
    end
  })

  if (optimizedRange) { // null if no sync required
    let syncRequired = true
    let futureSync = ds.futureSyncFor(optimizedRange)

    // Notify even if sync is later redundant; we notify end even if redundant
    ds.notifySyncStart({ exchange, symbol, tf, start, end })
    send(ws, ['data.sync.start', exchange, symbol, tf, start, end, meta])

    while (futureSync) {
      debug(
        'waiting for future sync to complete (%d - %d)',
        futureSync.start, futureSync.end
      )

      await ds.expectSync(futureSync)

      // Optimise range again
      optimizedRange = ds.optimizeSyncRange({
        exchange,
        symbol,
        tf,
        start,
        end
      })

      if (!optimizedRange) {
        syncRequired = false
        break
      }

      futureSync = ds.futureSyncFor(optimizedRange) // check again
    }

    if (syncRequired) {
      const { start, end } = optimizedRange

      if (ds.isSyncActive({ start, end })) {
        debug('awaiting sync %d - %d', start, end)
        await ds.expectSync({ start, end })
        debug('sync %d - %d finished, proceeding', start, end)
      } else {
        await Candle.syncRange({
          exchange,
          symbol,
          tf
        }, {
          start,
          end
        })
      }
    }

    ds.notifySyncEnd({ exchange, symbol, tf, start, end })
    send(ws, ['data.sync.end', exchange, symbol, tf, start, end, meta])
  }

  const candles = await Candle.getInRange([
    ['exchange', '=', exchange],
    ['symbol', '=', symbol],
    ['tf', '=', tf]
  ], {
    key: 'mts',
    start,
    end
  }, {
    orderBy: 'mts',
    orderDirection: 'asc'
  })

  debug(
    'responding with %d candles for range %d - %d [%s %s]',
    candles.length, start, end, symbol, tf
  )

  send(ws, ['data.candles', exchange, symbol, tf, type, start, end, meta, candles])

  return candles
}
