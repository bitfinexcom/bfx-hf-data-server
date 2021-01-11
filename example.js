'use strict'

// node examples/server-lowdb.js

const Ws = require('ws')
const ws = new Ws('ws://localhost:8899')

ws.on('open', () => {
  console.log('open')

  ws.send(
    JSON.stringify(msg)
  )
})

ws.on('message', (data) => {
  console.log(data)
})

/* eslint-disable */
const strategy = {
  defineIndicators: '(I) => {\n' +
    '  const indicators = {\n' +
    "  \temaL: new I.EMA([100, 'high']),\n" +
    "  \temaS: new I.EMA([10, 'low']),\n" +
    '  }\n' +
    '  \n' +
    "  indicators.emaL.color = '#00ff00'\n" +
    "  indicators.emaS.color = '#ff0000'\n" +
    '    \n' +
    '  return indicators\n' +
    '}',
  onEnter: '({ HFS, _, HFU }) => async (state = {}, update = {}) => {\n' +
    '  if (HFS.getNumCandles(state) < 2) { // 2 price points needed\n' +
    '    return state\n' +
    '  }\n' +
    '\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  const amount = 1\n' +
    '  \n' +
    '  if (emaS.crossed(l)) {\n' +
    '    if (s > l) {\n' +
    '      return HFS.openLongPositionMarket(state, {\n' +
    '        mtsCreate: mts,\n' +
    '        amount,\n' +
    '        price,\n' +
    "        label: 'enter long',\n" +
    '      })\n' +
    '    } else {\n' +
    '      return HFS.openShortPositionMarket(state, {\n' +
    '        mtsCreate: mts,\n' +
    '        amount,\n' +
    '        price,\n' +
    "        label: 'enter short',\n" +
    '      })\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  return state\n' +
    '}',
  onUpdateLong: '({ HFS, HFU }) => async (state = {}, update = {}) => {\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  \n' +
    '  if (emaS.crossed(l) && s < l) {\n' +
    '    return HFS.closePositionMarket(state, {\n' +
    '      price,\n' +
    '      mtsCreate: mts,\n' +
    "      label: 'close long',\n" +
    '    })\n' +
    '  }\n' +
    '  \n' +
    '  return state\n' +
    '}',
  onUpdateShort: '({ HFS, HFU }) => async (state = {}, update = {}) => {\n' +
    '  const { price, mts } = update\n' +
    '  const i = HFS.indicators(state)\n' +
    '  const iv = HFS.indicatorValues(state)\n' +
    '  const { emaS } = i\n' +
    '  const l = iv.emaL\n' +
    '  const s = iv.emaS\n' +
    '  \n' +
    '  if (emaS.crossed(l) && s > l) {\n' +
    '    return HFS.closePositionMarket(state, {\n' +
    '      price,\n' +
    '      mtsCreate: mts,\n' +
    "      label: 'close short',\n" +
    '    })\n' +
    '  }\n' +
    '  \n' +
    '  return state\n' +
    '}',
  id: null
}

const msg = [
  'exec.str',
  [
    'bitfinex',
    1610029361708,
    1610114861708,
    'tBTCUSD',
    '15m',
    true,
    false,
    true,
    strategy,
    '1610115118349-tBTCUSD-15m-1610029361708-1610114861708'
  ]
]

const bugMsg = [
  'exec.str',
  [
    'bitfinex',
    1610029109969,
    1610114609969,
    'tADABTC',
    '15m',
    true,
    false,
    true,
    strategy,
    '1610115118342-tADABTC-15m-1610029109969-1610114609969'
  ]
]
