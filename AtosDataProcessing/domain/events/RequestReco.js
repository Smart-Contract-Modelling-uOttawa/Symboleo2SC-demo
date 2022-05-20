const { Event } = require("symboleo-js-core");

class RequestReco extends Event {
  constructor(_name,id) {
    super()
    this._name = _name
    this.id = id
  }
}

module.exports.RequestReco = RequestReco
