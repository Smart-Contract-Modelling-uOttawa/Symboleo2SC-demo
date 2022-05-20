const { Event } = require("symboleo-js-core");

class NoticeIssued extends Event {
  constructor(_name,) {
    super()
    this._name = _name
  }
}

module.exports.NoticeIssued = NoticeIssued
