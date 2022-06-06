const delay = require('../util/delay')
const { MINUTE, MAX_REQUESTS_PER_MINUTE } = require('./constants')

const MAX_RETRIES = 3

class RequestSemaphore {
  constructor ({
    maxRequests = MAX_REQUESTS_PER_MINUTE,
    maxTries = MAX_RETRIES,
    interval = MINUTE
  } = {}) {
    this.queue = []
    this.capacity = 0
    this.isSuspended = false

    this.maxRequests = maxRequests
    this.maxTries = maxTries
    this.interval = interval

    this.dequeue = this.dequeue.bind(this)
  }

  add (req) {
    return new Promise((resolve, reject) => {
      this.queue.push({ req, resolve, reject })
      this.dequeue()
    })
  }

  dequeue () {
    if (this.queue.length === 0) {
      return
    }
    if (!this.timeSpan || Date.now() > this.timeSpan) {
      this.reset()
    }
    if (this.capacity === 0 || this.isSuspended) {
      setTimeout(this.dequeue, this.interval)
      return
    }

    this.capacity--
    const { req, resolve, reject, retries = 0 } = this.queue.shift()

    req()
      .then(resolve)
      .catch((err) => {
        if (err.message.includes('ratelimit')) {
          this._rateLimitReached()
        }
        if (retries >= this.maxTries) {
          return reject(err)
        }
        this.queue.push({ req, resolve, reject, retries: retries + 1 })
      })
      .finally(this.dequeue)
  }

  reset () {
    this.timeSpan = Date.now() + this.interval
    this.capacity = this.maxRequests
  }

  _rateLimitReached () {
    this.isSuspended = true

    delay(this.interval)
      .then(() => {
        this.isSuspended = false
        this.dequeue()
      })
  }
}

module.exports = RequestSemaphore
