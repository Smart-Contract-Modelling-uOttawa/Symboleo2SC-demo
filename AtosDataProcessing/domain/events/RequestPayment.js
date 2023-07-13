const { Event } = require("symboleo-js-core");

class RequestPayment extends Event {
  constructor(_name,amount) {
    super()
    this._name = _name
    this.amount = amount
  }
}

module.exports.RequestPayment = RequestPayment
