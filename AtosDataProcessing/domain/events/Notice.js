const { Event } = require("symboleo-js-core");

class Notice extends Event {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.Notice = Notice
