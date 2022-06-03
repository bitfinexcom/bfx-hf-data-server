const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const MAX_ITEMS_PER_REQUEST = 10000
const MAX_REQUESTS_PER_MINUTE = 90
const THROTTLE = Math.ceil(MINUTE / MAX_REQUESTS_PER_MINUTE)

const TIMEFRAME_IN_MS = {
  '1m': MINUTE,
  '5m': 5 * MINUTE,
  '15m': 15 * MINUTE,
  '30m': 30 * MINUTE,
  '1h': HOUR,
  '3h': 3 * HOUR,
  '6h': 6 * HOUR,
  '12h': 12 * HOUR,
  '1D': DAY,
  '1W': 7 * DAY,
  '14D': 14 * DAY,
  '1M': 30 * DAY
}

module.exports = {
  MINUTE,
  HOUR,
  DAY,
  MAX_ITEMS_PER_REQUEST,
  MAX_REQUESTS_PER_MINUTE,
  THROTTLE,
  TIMEFRAME_IN_MS
}
