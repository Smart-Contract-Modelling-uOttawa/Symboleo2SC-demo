const { Role } = require("symboleo-js-core");

class Processor extends Role {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.Processor = Processor
