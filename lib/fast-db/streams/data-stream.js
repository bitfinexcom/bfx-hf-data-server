const { Duplex } = require('stream')
const { waitUntilFullyDrained } = require('./wait-until-fully-drained')

class DataStream extends Duplex {
  constructor () {
    super({
      objectMode: true,
      emitClose: true
    })
  }

  async ingest (iter) {
    try {
      for await (const item of iter) {
        this.push(item)
      }
      await waitUntilFullyDrained(this)
      this.destroy()
    } catch (err) {
      this.destroy(err)
    }
  }

  // to conform with the Duplex interface
  _read () {}
}

module.exports = DataStream
