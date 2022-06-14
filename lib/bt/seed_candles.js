const { candleWidth } = require('bfx-hf-util')
const { onSeedCandle } = require('bfx-hf-strategy')

module.exports = ({ symbol, timeframe, fetchCandles, start, candleSeed }) => {
  return async (state) => {
    const cWidth = candleWidth(timeframe)
    const seedStart = start - (candleSeed * cWidth)
    const candles = await fetchCandles(seedStart, start, candleSeed)

    for (const candle of candles) {
      candle.tf = timeframe
      candle.symbol = symbol

      state = onSeedCandle(state, candle)
    }

    return state
  }
}
