const { Event } = require("symboleo-js-core");

class Delivered extends Event {
  constructor(_name,item,deliveryAddress,delDueDate) {
    super()
    this._name = _name
    this.item = item
    this.deliveryAddress = deliveryAddress
    this.delDueDate = delDueDate
  }
}

module.exports.Delivered = Delivered
