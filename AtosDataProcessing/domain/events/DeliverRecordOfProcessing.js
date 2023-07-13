const { Event } = require("symboleo-js-core");

class DeliverRecordOfProcessing extends Event {
  constructor(_name,dataId, processingInstruction) {
    super()
    this._name = _name
    this.dataId = dataId
    this.processingInstruction = processingInstruction
  }
}

module.exports.DeliverRecordOfProcessing = DeliverRecordOfProcessing
