const { Instruction } = require("../assets/Instruction.js")
const { ProccessedData } = require("../events/ProccessedData.js")
const { DpEvent } = require("../events/DpEvent.js")
const { DeliveredRecord } = require("../events/DeliveredRecord.js")
const { RequestReco } = require("../events/RequestReco.js")
const { RecordedProcess } = require("../events/RecordedProcess.js")
const { Paid } = require("../events/Paid.js")
const { Processor } = require("../roles/Processor.js")
const { Controller } = require("../roles/Controller.js")
const { OriginDataType } = require("../types/OriginDataType.js")
const { RegionData } = require("../types/RegionData.js")
const { CatSubjects } = require("../types/CatSubjects.js")
const { CateProcessingAct } = require("../types/CateProcessingAct.js")
const { DataType } = require("../types/DataType.js")
const { SymboleoContract } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

class AtosDataProcessing extends SymboleoContract {
  constructor(atos,client,inst,dType,dataPointId) {
    super("AtosDataProcessing")
    this._name = "AtosDataProcessing"
    this.atos = atos
    this.client = client
    this.inst = inst
    this.dType = dType
    this.dataPointId = dataPointId
    
    this.obligations = {};
    this.survivingObligations = {};
    this.powers = {};
    
    // assign varaibles of the contract
    this.processedData = new ProccessedData("processedData")
    this.processedData.dataType = this.dType
    this.adaptedInst = new DpEvent("adaptedInst")
    this.infringNotified = new DpEvent("infringNotified")
    this.suspendNoticed = new DpEvent("suspendNoticed")
    this.modifiedInst = new DpEvent("modifiedInst")
    this.recoProcessedData = new RecordedProcess("recoProcessedData")
    this.recoProcessedData.id = this.dataPointId
    this.paid = new Paid("paid")
    this.deliveredRecord = new DeliveredRecord("deliveredRecord")
    this.deliveredRecord.id = this.dataPointId
    this.requestedRecord = new RequestReco("requestedRecord")
    this.requestedRecord.id = this.dataPointId
    
    // create instance of triggered obligations
    this.obligations.oproccData = new Obligation('oproccData', this.client, this.atos, this)
  }
}

module.exports.AtosDataProcessing = AtosDataProcessing
