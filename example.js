'use strict'

// node examples/server-lowdb.js

const Ws = require('ws')
const ws = new Ws('ws://localhost:8899')

const terms = require('bitfinex-terminal-terms-of-use')

ws.on('open', () => {
  console.log('open')

  ws.send(
    JSON.stringify(msgDazaar)
  )
})

ws.on('message', (data) => {
  console.log(data)
})

/*
const lsCores = [
  'manage.cores', [
    'ls'
  ]
]

const rmCores = [
  'manage.cores', [
    'rm',
    {
      dirs: [
        '03a3af100709be37800a189e64d51fe63cd62d6660ce9bf3e6fea3d6670c1310_trades_tBTCUSD',
        '76ef1d766eee63ff473e33e1f231c3b65cf1042b1a353c027b48bdbeba00b969_candles_tBTCUSD'
      ]
    }
  ]
]
*/

// eslint-disable-next-line
const strategy = {"defineIndicators":"(I) => {\n  const indicators = {\n  \temaL: new I.EMA([100, 'high']),\n  \temaS: new I.EMA([10, 'low']),\n  }\n  \n  indicators.emaL.color = '#00ff00'\n  indicators.emaS.color = '#ff0000'\n    \n  return indicators\n}","onEnter":"({ HFS, _, HFU }) => async (state = {}, update = {}) => {\n  if (HFS.getNumCandles(state) < 2) { // 2 price points needed\n    return state\n  }\n\n  const { price, mts } = update\n  const i = HFS.indicators(state)\n  const iv = HFS.indicatorValues(state)\n  const { emaS } = i\n  const l = iv.emaL\n  const s = iv.emaS\n  const amount = 1\n  \n  if (emaS.crossed(l)) {\n    if (s > l) {\n      return HFS.openLongPositionMarket(state, {\n        mtsCreate: mts,\n        amount,\n        price,\n        label: 'enter long',\n      })\n    } else {\n      return HFS.openShortPositionMarket(state, {\n        mtsCreate: mts,\n        amount,\n        price,\n        label: 'enter short',\n      })\n    }\n  }\n\n  return state\n}","onUpdateLong":"({ HFS, HFU }) => async (state = {}, update = {}) => {\n  const { price, mts } = update\n  const i = HFS.indicators(state)\n  const iv = HFS.indicatorValues(state)\n  const { emaS } = i\n  const l = iv.emaL\n  const s = iv.emaS\n  \n  if (emaS.crossed(l) && s < l) {\n    return HFS.closePositionMarket(state, {\n      price,\n      mtsCreate: mts,\n      label: 'close long',\n    })\n  }\n  \n  return state\n}","onUpdateShort":"({ HFS, HFU }) => async (state = {}, update = {}) => {\n  const { price, mts } = update\n  const i = HFS.indicators(state)\n  const iv = HFS.indicatorValues(state)\n  const { emaS } = i\n  const l = iv.emaL\n  const s = iv.emaS\n  \n  if (emaS.crossed(l) && s > l) {\n    return HFS.closePositionMarket(state, {\n      price,\n      mtsCreate: mts,\n      label: 'close short',\n    })\n  }\n  \n  return state\n}"}

// eslint-disable-next-line
const msg = [
  'exec.str', [
    'bitfinex',
    1603208138745,
    1603293638745,
    'tABSUSD',
    '15m',
    true,
    true,
    true,
    strategy
  ]
]

const cores = [
  ['76ef1d766eee63ff473e33e1f231c3b65cf1042b1a353c027b48bdbeba00b969', 'candles'],
  ['03a3af100709be37800a189e64d51fe63cd62d6660ce9bf3e6fea3d6670c1310', 'trades']
]

const msgDazaar = [
  'exec.dazaar', [
    'bitfinex',
    1603208138745,
    1603208138745 + (60 * 60 * 1000), // 1603293638745
    'tBTCUSD',
    cores,
    '15m',
    { store: true, terms },
    strategy
  ]
]
