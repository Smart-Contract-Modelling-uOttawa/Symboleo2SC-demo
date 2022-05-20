const { Event } = require("symboleo-js-core");

class ProccessedData extends Event {
  constructor(_name,instruction,dataType,id) {
    super()
    this._name = _name
    this.instruction = instruction
    this.dataType = dataType
    this.id = id
  }
}

module.exports.ProccessedData = ProccessedData
