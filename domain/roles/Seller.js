const { Role } = require("symboleo-js-core");

class Seller extends Role {
  constructor(_name,returnAddress,name) {
    super()
    this._name = _name
    this.returnAddress = returnAddress
    this.name = name
  }
}

module.exports.Seller = Seller
