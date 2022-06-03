const Heap = require('heap')
const EventEmitter = require('events')
const ExecutionContext = require('./context')

/**
 * @typedef {{mts: number}} DataPoint
 */

const compareDataPoints = (a, b) => {
  return a.mts - b.mts
}

class DataPointFeed extends EventEmitter {
  constructor () {
    super()
    this.heap = new Heap(compareDataPoints)
    this.closed = false
    this.streams = []
  }

  /**
   * @param {DataPoint} item
   */
  push (item) {
    if (this.closed) {
      throw new Error('Cannot push to closed feed')
    }

    this.heap.push(item)
    this.emit('data')
  }

  pop () {
    return this.heap.pop()
  }

  size () {
    return this.heap.size()
  }

  addStream (stream) {
    this.streams.push(stream)
  }

  start (start, end) {
    const ctx = new ExecutionContext()

    const streamsInProgress = this.streams.map((stream) =>
      stream.fetchPaginated(this, ctx, start, end)
    )

    Promise.all(streamsInProgress)
      .then(() => {
        this.close()
        ctx.close()
      })

    return ctx
  }

  requestDrain (limit) {
    this.emit('drain', limit) // TODO
  }

  close () {
    this.emit('close')
  }
}

module.exports = DataPointFeed
