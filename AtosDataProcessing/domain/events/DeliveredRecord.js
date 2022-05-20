const { Event } = require("symboleo-js-core");

class DeliveredRecord extends Event {
  constructor(_name,id) {
    super()
    this._name = _name
    this.id = id
  }
}

module.exports.DeliveredRecord = DeliveredRecord
