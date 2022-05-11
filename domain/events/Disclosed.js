const { Event } = require("symboleo-js-core");

class Disclosed extends Event {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.Disclosed = Disclosed
