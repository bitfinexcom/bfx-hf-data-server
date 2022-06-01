const sortIntervals = (a, b) => {
  if (a.low < b.low) return -1
  if ((a.high - a.low) < (b.high - b.low)) return 1
  return 0
}

const fillTheGaps = (intervals, start, end) => {
  const inDisk = intervals.slice(0).sort(sortIntervals)

  const result = []

  while (inDisk.length > 0) {
    const current = inDisk.shift()

    if (current.low > end) {
      if (start < end) {
        result.push({ low: start, high: end, pending: true })
      }
      break
    }

    if (start < current.low) {
      result.push({ low: start, high: current.low - 1, pending: true })
      start = current.low
    }

    if (start === current.low || start <= current.high) {
      result.push({ ...current, offset: start, limit: Math.min(end, current.high) })
      start = current.high + 1
    }
  }

  return result
}

module.exports = {
  fillTheGaps
}
