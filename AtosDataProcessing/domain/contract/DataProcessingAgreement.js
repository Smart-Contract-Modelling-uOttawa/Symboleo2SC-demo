const { Instruction } = require("../assets/Instruction.js")
const { Data } = require("../assets/Data.js")
const { RequestDataProcessing } = require("../events/RequestDataProcessing.js")
const { ProcessData } = require("../events/ProcessData.js")
const { RecoProcessedData } = require("../events/RecoProcessedData.js")
const { ModifyInstruction } = require("../events/ModifyInstruction.js")
const { RequestRecordOfProcessing } = require("../events/RequestRecordOfProcessing.js")
const { DeliverRecordOfProcessing } = require("../events/DeliverRecordOfProcessing.js")
const { Notice } = require("../events/Notice.js")
const { Pay } = require("../events/Pay.js")
const { RequestPayment } = require("../events/RequestPayment.js")
const { Processor } = require("../roles/Processor.js")
const { Controller } = require("../roles/Controller.js")
const { Origin } = require("../types/Origin.js")
const { Region } = require("../types/Region.js")
const { CategorySubjects } = require("../types/CategorySubjects.js")
const { ProcessingActitvity } = require("../types/ProcessingActitvity.js")
const { SymboleoContract } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

class DataProcessingAgreement extends SymboleoContract {
  constructor(atos, client, instruction) {
    super("DataProcessingAgreement")
    this._name = "DataProcessingAgreement"
    this.atos = atos
    this.client = client
    this.instruction = instruction
    
    this.obligations = {};
    this.survivingObligations = {};
    this.powers = {};
    
    // assign varaibles of the contract
    this.requestedDataProcessing = new RequestDataProcessing("requestedDataProcessing")
    this.processedData = new ProcessData("processedData")
    this.recoProcessedData = new RecoProcessedData("recoProcessedData")
    this.requestedRecordOfProcessing = new RequestRecordOfProcessing("requestedRecordOfProcessing")
    this.deliveredRecordOfProcessing = new DeliverRecordOfProcessing("deliveredRecordOfProcessing")
    this.adaptedInstruction = new ModifyInstruction("adaptedInstruction")
    this.infringementNotified = new Notice("infringementNotified")
    this.suspensionNotified = new Notice("suspensionNotified")
    this.clientAgreedTermination = new Notice("clientAgreedTermination")
    this.providerAgreedTermination = new Notice("providerAgreedTermination")
    this.paidServiceProvider = new Pay("paidServiceProvider")
    this.requestedPayment = new RequestPayment("requestedPayment")
    
    // create instance of triggered obligations
    this.obligations.provideDataProcessingService = new Obligation('provideDataProcessingService', this.client, this.atos, this)
  }
}

module.exports.DataProcessingAgreement = DataProcessingAgreement
