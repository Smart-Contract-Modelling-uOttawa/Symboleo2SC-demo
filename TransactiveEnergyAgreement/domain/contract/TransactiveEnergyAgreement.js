const { DispatchInstruction } = require("../assets/DispatchInstruction.js")
const { Bid } = require("../assets/Bid.js")
const { Invoice } = require("../assets/Invoice.js")
const { BidAccepted } = require("../events/BidAccepted.js")
const { EnergySupplied } = require("../events/EnergySupplied.js")
const { InvoiceIssued } = require("../events/InvoiceIssued.js")
const { NoticeIssued } = require("../events/NoticeIssued.js")
const { Paid } = require("../events/Paid.js")
const { PaidPenalty } = require("../events/PaidPenalty.js")
const { ISO } = require("../roles/ISO.js")
const { DERP } = require("../roles/DERP.js")
const { SymboleoContract } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

class TransactiveEnergyAgreement extends SymboleoContract {
  constructor(caiso,derp) {
    super("TransactiveEnergyAgreement")
    this._name = "TransactiveEnergyAgreement"
    this.caiso = caiso
    this.derp = derp
    
    this.obligations = {};
    this.survivingObligations = {};
    this.powers = {};
    
    // assign varaibles of the contract
    this.bidAccepted = new BidAccepted("bidAccepted")
    this.energySupplied = new EnergySupplied("energySupplied")
    this.caisoTerminationNoticeIssued = new NoticeIssued("caisoTerminationNoticeIssued")
    this.terminationNoticeThirtyDays = new NoticeIssued("terminationNoticeThirtyDays")
    this.derpTerminationNoticeIssued = new NoticeIssued("derpTerminationNoticeIssued")
    this.terminationNoticeNinetyDays = new NoticeIssued("terminationNoticeNinetyDays")
    this.creditInvoiceIssued = new InvoiceIssued("creditInvoiceIssued")
    this.isoPaid = new Paid("isoPaid")
    this.isoPaid.from = this.caiso
    this.isoPaid.to = this.derp
    this.penaltyInvoiceIssued = new InvoiceIssued("penaltyInvoiceIssued")
    this.paidPenalty = new PaidPenalty("paidPenalty")
    this.paidPenalty.from = this.derp
    this.paidPenalty.to = this.caiso
    
    // create instance of triggered obligations
    this.powers.terminateAgreementBySupplier = new Power('terminateAgreementBySupplier', this.derp, this.caiso, this)
  }
}

module.exports.TransactiveEnergyAgreement = TransactiveEnergyAgreement
