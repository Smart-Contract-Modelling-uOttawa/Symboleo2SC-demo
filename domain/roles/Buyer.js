const { Role } = require("symboleo-js-core");

class Buyer extends Role {
  constructor(_name,warehouse) {
    super()
    this._name = _name
    this.warehouse = warehouse
  }
}

module.exports.Buyer = Buyer
