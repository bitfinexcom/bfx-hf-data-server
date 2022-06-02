const EventEmitter = require('events')

class Context extends EventEmitter {
  constructor () {
    super()
    this.done = false
  }

  cancel () {
    if (this.done) return
    this.done = true
    this.emit('done')
  }

  destroy () {
    this.removeAllListeners()
  }
}

module.exports = Context
