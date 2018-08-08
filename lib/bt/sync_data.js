'use strict'

const debug = require('debug')('hf:data-server:bt:sync_data')
const { BFXTrade, BFXCandle } = require('../db/models')

const send = require('../ws/send')

module.exports = async (ws, rest, btArgs) => {
  const { symbol, tf, from, to, includeTrades } = btArgs

  debug('syncing data...')
  send(ws, ['bt.sync.start', symbol, tf, from, to])

  // TODO: normalize start/end and from/to naming (all)
  const syncArgs = {
    ...btArgs,
    start: btArgs.from,
    end: btArgs.to
  }

  // Ensure chunks are available
  await BFXCandle.syncRemoteRange(rest, syncArgs)

  if (includeTrades) {
    await BFXTrade.syncRemoteRange(rest, syncArgs)
  }

  send(ws, ['bt.sync.end', symbol, tf, from, to])
  debug('sync OK')
}
