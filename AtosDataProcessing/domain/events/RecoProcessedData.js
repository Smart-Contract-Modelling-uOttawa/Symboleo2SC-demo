const { Event } = require("symboleo-js-core");

class RecoProcessedData extends Event {
  constructor(_name,dataId) {
    super()
    this._name = _name
    this.dataId = dataId
  }
}

module.exports.RecoProcessedData = RecoProcessedData
