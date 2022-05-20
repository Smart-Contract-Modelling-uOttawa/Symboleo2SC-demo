const { PerishableGood } = require("./PerishableGood.js");

class Meat extends PerishableGood {
  constructor(_name,quantity,quality) {
    super(_name,quantity,quality)
  }
}

module.exports.Meat = Meat
