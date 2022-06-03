const EventEmitter = require('events')

class ExecutionContext extends EventEmitter {
  constructor () {
    super()
    this.done = false
  }

  close () {
    if (this.done) return
    this.done = true
    this.emit('done')
    this.removeAllListeners()
  }
}

module.exports = ExecutionContext
