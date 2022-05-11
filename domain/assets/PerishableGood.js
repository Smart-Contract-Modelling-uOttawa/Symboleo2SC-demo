const { Asset } = require("symboleo-js-core");

class PerishableGood extends Asset {
  constructor(_name,quantity,quality) {
    super()
    this._name = _name
    this.quantity = quantity
    this.quality = quality
  }
}

module.exports.PerishableGood = PerishableGood
