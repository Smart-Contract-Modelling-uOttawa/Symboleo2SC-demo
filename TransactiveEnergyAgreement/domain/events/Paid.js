const { Event } = require("symboleo-js-core");

class Paid extends Event {
  constructor(_name,invoiceId,from,to) {
    super()
    this._name = _name
    this.invoiceId = invoiceId
    this.from = from
    this.to = to
  }
}

module.exports.Paid = Paid
