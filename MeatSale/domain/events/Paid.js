const { Event } = require("symboleo-js-core");

class Paid extends Event {
  constructor(_name,amount,currency,from,to,payDueDate) {
    super()
    this._name = _name
    this.amount = amount
    this.currency = currency
    this.from = from
    this.to = to
    this.payDueDate = payDueDate
  }
}

module.exports.Paid = Paid
