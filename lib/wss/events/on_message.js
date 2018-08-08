'use strict'

const _isFunction = require('lodash/isFunction')
const debug = require('debug')('hf:data-server:wss:events:on_message')
const getCandleChunks = require('../cmds/get_candle_chunks')
const getCandles = require('../cmds/get_candles')
const getMarkets = require('../cmds/get_markets')
const getTrades = require('../cmds/get_trades')
const getBTs = require('../cmds/get_bts')
const execBT = require('../cmds/exec_bt')
// const submitBT = require('../cmds/submit_bt')

const cmdMap = {
  'exec.bt': execBT,
  'get.bts': getBTs,
  'get.markets': getMarkets,
  'get.candles': getCandles,
  'get.candle_chunks': getCandleChunks,
  'get.trades': getTrades,
}

module.exports = async (dsState, ws, msgJSON = '') => {
  let msg

  try {
    msg = JSON.parse(msgJSON)
  } catch (e) {
    debug('error reading ws client msg: %s', msgJSON)
  }

  if (!Array.isArray(msg)) {
    debug('ws client msg not an array: %j', msg)
    return
  }

  const [ cmd ] = msg
  const handler = cmdMap[cmd]

  if (!_isFunction(handler)) {
    debug('received unknown command: %s', cmd)
    return
  }

  return handler(dsState, ws, msg)
}
