const { Role } = require("symboleo-js-core");

class Controller extends Role {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.Controller = Controller
