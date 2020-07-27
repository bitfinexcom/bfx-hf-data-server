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

const msg = ['exec.bt', [
  'bitfinex',
  1595673910000,
  1595759415000,
  'tAAABBB',
  '1h',
  true,
  true,
  true,
  '1595846650039-tAAABBB-1h-1595673910000-1595759415000'
]]
