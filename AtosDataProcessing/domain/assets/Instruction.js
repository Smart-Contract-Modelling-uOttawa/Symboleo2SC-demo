const { Asset } = require("symboleo-js-core");

class Instruction extends Asset {
  constructor(_name,origin, region, categorySubjects, processingActitvity, isPersonal) {
    super()
    this._name = _name
    this.origin = origin
    this.region = region
    this.categorySubjects = categorySubjects
    this.processingActitvity = processingActitvity
    this.isPersonal = isPersonal
  }
}

module.exports.Instruction = Instruction
