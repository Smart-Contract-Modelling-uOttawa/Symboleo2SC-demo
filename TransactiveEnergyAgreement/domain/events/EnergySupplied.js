const { Event } = require("symboleo-js-core");

class EnergySupplied extends Event {
  constructor(_name,energy,dispatchStartTime,dispatchEndTime,voltage,ampere) {
    super()
    this._name = _name
    this.energy = energy
    this.dispatchStartTime = dispatchStartTime
    this.dispatchEndTime = dispatchEndTime
    this.voltage = voltage
    this.ampere = ampere
  }
}

module.exports.EnergySupplied = EnergySupplied
