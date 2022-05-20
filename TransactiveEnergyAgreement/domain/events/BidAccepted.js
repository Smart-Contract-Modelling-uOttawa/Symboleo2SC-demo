const { Event } = require("symboleo-js-core");

class BidAccepted extends Event {
  constructor(_name,bid) {
    super()
    this._name = _name
    this.bid = bid
  }
}

module.exports.BidAccepted = BidAccepted
