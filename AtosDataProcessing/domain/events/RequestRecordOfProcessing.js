const { Event } = require("symboleo-js-core");

class RequestRecordOfProcessing extends Event {
  constructor(_name,dataId) {
    super()
    this._name = _name
    this.dataId = dataId
  }
}

module.exports.RequestRecordOfProcessing = RequestRecordOfProcessing
