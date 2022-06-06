const delay = require('../util/delay')
const { MINUTE, MAX_REQUESTS_PER_MINUTE } = require('./constants')

const MAX_RETRIES = 3

class RequestSemaphore {
  constructor ({
    maxRequests = MAX_REQUESTS_PER_MINUTE,
    maxTries = MAX_RETRIES
  } = {}) {
    this.queue = []
    this.capacity = 0
    this.isSuspended = false
    this.maxRequests = maxRequests
    this.maxTries = maxTries

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
      this.timeSpan = Date.now() + MINUTE
      this.capacity = this.maxRequests
    }
    if (this.capacity === 0 || this.isSuspended) {
      setTimeout(this.dequeue, MINUTE)
      return
    }

    this.capacity--
    const { req, resolve, reject, retries = 0 } = this.queue.shift()

    req()
      .then(resolve)
      .catch((err) => {
        reject(err)
      })
      .finally(this.dequeue)
  }

  rateLimitReached () {
    this.isSuspended = true

    delay(MINUTE)
      .then(() => {
        this.isSuspended = false
        this.dequeue()
      })
  }
}

module.exports = RequestSemaphore
