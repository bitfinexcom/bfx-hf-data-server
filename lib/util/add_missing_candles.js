'use strict'

const { candleWidth } = require('bfx-hf-util')

module.exports = (candles, tf, { start: startTime, end: endTime }) => {
  const paddedCandles = [...candles]
  const duration = candleWidth(tf)
  let addedCandlesCount = 0
  for (let i = 0; i < candles.length; i += 1) {
    const candle = candles[i]
    const candleTime = candle.mts

    // if start candles are missing
    if (i === 0 && candleTime > (startTime + duration)) {
      const candlesToFill = Math.ceil((candleTime - startTime) / duration) - 1
      if (candlesToFill > 0) {
        const fillerCandles = Array.apply(null, Array(candlesToFill)).map((c, i) => {
          return _copyCandleWithNewTime(candle, candle.mts - (duration * (candlesToFill - i)))
        })

        paddedCandles.splice(0, 0, ...fillerCandles)
        addedCandlesCount += fillerCandles.length
      }
    }

    // if middle or end candles are missing
    const nextCandle = candles[i + 1]
    const nextCandleTime = nextCandle ? nextCandle.mts : endTime
    const candlesToFill = Math.ceil((nextCandleTime - candleTime) / duration) - 1

    if (candlesToFill > 0) {
      const fillerCandles = Array.apply(null, Array(candlesToFill)).map((c, i) => {
        return _copyCandleWithNewTime(candle, candle.mts + (duration * (i + 1)))
      })

      paddedCandles.splice(i + 1 + addedCandlesCount, 0, ...fillerCandles)
      addedCandlesCount += fillerCandles.length
    }
  }

  return paddedCandles
}

const _copyCandleWithNewTime = (candle, newTime) => {
  return {
    ...candle,
    mts: newTime,
    open: candle.close,
    close: candle.close,
    high: candle.close,
    low: candle.close,
    volume: 0
  }
}
