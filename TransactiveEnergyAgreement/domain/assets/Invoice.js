const { Asset } = require("symboleo-js-core");

class Invoice extends Asset {
  constructor(_name,id,date,amount) {
    super()
    this._name = _name
    this.id = id
    this.date = date
    this.amount = amount
  }
}

module.exports.Invoice = Invoice
