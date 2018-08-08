'use strict'

const startWSS = require('./wss/start_wss')

module.exports = async ({
  symbols = [],
  timeframes = [],
  port = 8899,
  rest
}) => {
  const dsState = {
    symbols,
    timeframes,
    port,
    rest
  }

  return {
    ...dsState,
    wss: startWSS(dsState),
  }
}
