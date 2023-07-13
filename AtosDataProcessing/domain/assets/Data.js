const { Asset } = require("symboleo-js-core");

class Data extends Asset {
  constructor(_name,id, content) {
    super()
    this._name = _name
    this.id = id
    this.content = content
  }
}

module.exports.Data = Data
