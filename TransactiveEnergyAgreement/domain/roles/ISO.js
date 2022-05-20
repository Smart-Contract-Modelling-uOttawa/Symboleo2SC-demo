const { Role } = require("symboleo-js-core");

class ISO extends Role {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.ISO = ISO
