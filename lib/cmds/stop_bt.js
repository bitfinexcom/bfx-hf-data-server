const send = require('../wss/send')

/**
 * @param {DataServer} ds
 * @param {WebSocket} ws
 * @param {Array} msg
 * @return {Promise<void>}
 */
module.exports = async (ds, ws, msg) => {
  const [, gid] = msg

  if (ds.activeBacktests.has(gid)) {
    const context = ds.activeBacktests.get(gid)
    context.close()
  }

  send(ws, ['bt.stopped', gid])
}
