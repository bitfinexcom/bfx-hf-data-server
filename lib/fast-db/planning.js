const sortIntervals = (a, b) => {
  if (a.start < b.start) return -1
  if ((a.end - a.start) < (b.end - b.start)) return 1
  return 0
}

const fillTheGaps = (intervals, start, end) => {
  const inDisk = intervals.slice(0).sort(sortIntervals)

  const result = []

  while (inDisk.length > 0) {
    const current = inDisk.shift()

    if (current.start > end) {
      break
    }

    if (start < current.start) {
      result.push({ start, end: current.start - 1, pending: true })
      start = current.start
    }

    if (start === current.start || start <= current.end) {
      result.push({ ...current, offset: start, limit: Math.min(end, current.end) })
      start = current.end + 1
    }
  }

  if (start < end) {
    result.push({ start, end, pending: true })
  }

  return result
}

module.exports = {
  fillTheGaps
}
