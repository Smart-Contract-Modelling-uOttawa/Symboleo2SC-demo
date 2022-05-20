const { Asset } = require("symboleo-js-core");

class DispatchInstruction extends Asset {
  constructor(_name,maxVoltage,minVoltage) {
    super()
    this._name = _name
    this.maxVoltage = maxVoltage
    this.minVoltage = minVoltage
  }
}

module.exports.DispatchInstruction = DispatchInstruction
