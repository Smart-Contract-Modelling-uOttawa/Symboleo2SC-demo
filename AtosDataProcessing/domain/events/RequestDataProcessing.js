const { Event } = require("symboleo-js-core");

class RequestDataProcessing extends Event {
  constructor(_name,dataPoint) {
    super()
    this._name = _name
    this.dataPoint = dataPoint
  }
}

module.exports.RequestDataProcessing = RequestDataProcessing
