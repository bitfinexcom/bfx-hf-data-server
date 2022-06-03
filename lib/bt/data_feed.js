const Heap = require('heap')
const EventEmitter = require('events')

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
    this.windowLowerBound = -1
  }

  /**
   * @param {DataPoint} item
   */
  push (item) {
    if (this.closed) {
      return
    }

    this.heap.push(item)
  }

  peek () {
    return this.heap.peek()
  }

  pop () {
    return this.heap.pop()
  }

  size () {
    return this.heap.size()
  }

  /**
   * @param {DataPointStream} stream
   */
  addStream (stream) {
    this.streams.push(stream)
  }

  /**
   * @param {ExecutionContext} ctx
   * @param {number} start
   * @param {number} end
   * @return {Promise}
   */
  start (ctx, start, end) {
    const streamsInProgress = this.streams.map((stream) =>
      stream.fetchPaginated(this, ctx, start, end)
    )

    ctx.once('done', () => this.close())

    return Promise.all(streamsInProgress)
      .then(() => this.close())
  }

  requestDrain () {
    // each stream works as a data window
    // allow consumers to drain until the lower bound that is common to all windows
    // this way we don't send data out of sync
    this.windowLowerBound = Math.min(
      ...this.streams.map(stream => stream.offset)
    )

    if (this.windowLowerBound > 0) {
      this.emit('drain')
    }
  }

  close () {
    if (this.closed) return
    this.closed = true
    this.emit('close')
  }
}

module.exports = DataPointFeed
