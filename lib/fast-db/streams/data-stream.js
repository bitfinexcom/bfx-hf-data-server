const { Duplex } = require('stream')

class DataStream extends Duplex {
  /**
   * @param {Promise<Array>} pendingData
   */
  constructor (pendingData) {
    super({
      objectMode: true,
      emitClose: true
    })

    pendingData
      .then(this.onData.bind(this))
      .catch(this.onError.bind(this))
  }

  /**
   * @param {Array} list
   */
  onData (list) {
    list.forEach(item => this.push(item))
    this.end()
  }

  /**
   * @param {Error} err
   */
  onError (err) {
    this.destroy(err)
  }

  // to conform with the Duplex interface
  _read (n) {}
}

module.exports = DataStream
