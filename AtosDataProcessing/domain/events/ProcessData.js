const { Event } = require("symboleo-js-core");

class ProcessData extends Event {
  constructor(_name,dataId, instruction) {
    super()
    this._name = _name
    this.dataId = dataId
    this.instruction = instruction
  }
}

module.exports.ProcessData = ProcessData
