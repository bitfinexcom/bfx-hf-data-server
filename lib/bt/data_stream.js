class DataPointStream {
  /**
   * @param {function(start: number, end: number): Promise<DataPoint[]>} fetchDataPoints
   */
  constructor (fetchDataPoints) {
    this.offset = -1
    this.fetchDataPoints = fetchDataPoints
  }

  /**
   * @param {DataPointFeed} feed
   * @param {ExecutionContext} ctx
   * @param {number} start
   * @param {number} end
   */
  async fetchPaginated (feed, ctx, start, end) {
    this.offset = start

    while (this.offset < end) {
      if (ctx.done) {
        return
      }

      const dataPoints = await this.fetchDataPoints(this.offset, end)

      if (dataPoints.length === 0) {
        break
      }

      dataPoints.forEach(dp => feed.push(dp))
      const lastDataPoint = dataPoints[dataPoints.length - 1]
      this.offset = lastDataPoint.mts + 1

      feed.requestDrain()
    }

    this.offset = Math.max(this.offset, end)
  }
}

module.exports = DataPointStream
