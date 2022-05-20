const { Asset } = require("symboleo-js-core");

class Bid extends Asset {
  constructor(_name,id,dispatchStartTime,dispatchEndTime,energy,price,instruction) {
    super()
    this._name = _name
    this.id = id
    this.dispatchStartTime = dispatchStartTime
    this.dispatchEndTime = dispatchEndTime
    this.energy = energy
    this.price = price
    this.instruction = instruction
  }
}

module.exports.Bid = Bid
