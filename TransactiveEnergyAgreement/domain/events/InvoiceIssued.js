const { Event } = require("symboleo-js-core");

class InvoiceIssued extends Event {
  constructor(_name,invoice) {
    super()
    this._name = _name
    this.invoice = invoice
  }
}

module.exports.InvoiceIssued = InvoiceIssued
