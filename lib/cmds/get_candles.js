'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:get-candles')
const send = require('../wss/send')

// TODO: Avoid duplicate syncs
module.exports = async (ds, ws, msg) => {
  const [, exchange, symbol, tf, type, reqStart, reqEnd] = msg
  const { db } = ds
  const { Candle } = db

  let optimizedRange = ds.optimizeSyncRange({
    start: reqStart,
    end: reqEnd,
  })

  if (optimizedRange) { // null if no sync required
    let syncRequired = true
    let futureSync = ds.futureSyncFor(optimizedRange)

    while (futureSync) {
      debug(
        'waiting for future sync to complete (%d - %d)',
        futureSync.start, futureSync.end
      )

      await ds.expectSync(futureSync)

      // Optimise range again
      optimizedRange = ds.optimizeSyncRange({
        start: reqStart,
        end: reqEnd,
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
        ds.notifySyncStart({ start, end })
        send(ws, ['data.sync.start', symbol, tf, start, end])

        await Candle.syncRange({
          exchange,
          symbol,
          tf,
        }, {
          start,
          end,
        }, () => {}, () => {
          ds.notifySyncEnd({ start, end })
        })

        send(ws, ['data.sync.end', symbol, tf, start, end])
      }
    }
  }

  const candles = await Candle.getInRange([
    ['exchange', '=', exchange],
    ['symbol', '=', symbol],
    ['tf', '=', tf],
  ], {
    key: 'mts',
    start: reqStart,
    end: reqEnd,
  })

  debug(
    'responding with %d candles for range %d - %d',
    candles.length, reqStart, reqEnd
  )
  
  send(ws, ['data.candles', symbol, tf, type, reqStart, reqEnd, candles])

  return candles
}
