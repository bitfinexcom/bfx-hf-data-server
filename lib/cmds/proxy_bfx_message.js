'use strict'

const debug = require('debug')('bfx:hf:data-server:cmds:proxy-bfx')

module.exports = async (ds, ws, msg, clientID) => {
  const { bfxProxies } = ds
  const proxy = bfxProxies[clientID]
  const [, bfxMessage] = msg

  if (!proxy) {
    debug('cannot proxy message, no bfx proxy available')
    return
  }

  if (proxy.isOpen()) {
    debug('proxying to bfx: %j', bfxMessage)

    proxy.send(bfxMessage)
  }
}
