const { Event } = require("symboleo-js-core");

class DpEvent extends Event {
  constructor(_name,instruction) {
    super()
    this._name = _name
    this.instruction = instruction
  }
}

module.exports.DpEvent = DpEvent
