const { Event } = require("symboleo-js-core");

class Pay extends Event {
  constructor(_name,amount) {
    super()
    this._name = _name
    this.amount = amount
  }
}

module.exports.Pay = Pay
