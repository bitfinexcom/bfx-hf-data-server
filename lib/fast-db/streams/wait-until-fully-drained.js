const flatPromise = require('flat-promise')

const waitUntilFullyDrained = (stream) => {
  if (!stream._readableState) {
    return Promise.resolve()
  }

  const { promise, resolve } = flatPromise()

  const check = () => {
    if (stream._readableState.length > 0) {
      return setImmediate(check)
    }

    return Promise.all(
      stream._readableState.pipes
        .map(stream => waitUntilFullyDrained(stream))
    )
      .then(resolve)
  }

  setImmediate(check)

  return promise
}

module.exports = { waitUntilFullyDrained }
