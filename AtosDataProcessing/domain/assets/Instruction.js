const { Asset } = require("symboleo-js-core");

class Instruction extends Asset {
  constructor(_name,originData,regionData,categoriesDataSubjects,categoriesProcessingActivity) {
    super()
    this._name = _name
    this.originData = originData
    this.regionData = regionData
    this.categoriesDataSubjects = categoriesDataSubjects
    this.categoriesProcessingActivity = categoriesProcessingActivity
  }
}

module.exports.Instruction = Instruction
