'use strict'

const sendError = require('../wss/send_error')
const send = require('../wss/send')

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const _rimraf = require('rimraf')

const readDir = promisify(fs.readdir).bind(fs)
const rimraf = promisify(_rimraf).bind(_rimraf)

async function lsCores (dir) {
  const cores = await readDir(path.join(dir, 'dazaar'))

  const res = cores.filter((el) => {
    return el[0] !== '.'
  })

  return res
}

async function rmCores (dir, opts) {
  const { dirs } = opts

  for (const el of dirs) {
    const core = path.join(dir, 'dazaar', el)

    await rimraf(core)
  }
}

module.exports = async (ds, ws, msg) => {
  try {
    const { dir } = ds

    const [
      cmd, opts
    ] = msg[1] || []

    let res
    switch (cmd) {
      case 'ls':
        res = await lsCores(dir)
        break
      case 'rm':
        await rmCores(dir, opts)
        res = await lsCores(dir)
        break
      default:
        console.error('ERR_CMD_UNKN:', cmd)
        return send(ws, ['bt.btresult', { error: 'ERR_CMD_UNKN' }])
    }

    send(ws, ['man.' + cmd, { res }])
  } catch (e) {
    console.error('ERR_EXEC_MC', e)
    return sendError(ws, 'ERR_EXEC_MC: ' + e.message)
  }
}
