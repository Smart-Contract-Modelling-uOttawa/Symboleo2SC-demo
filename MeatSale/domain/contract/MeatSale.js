const { PerishableGood } = require("../assets/PerishableGood.js")
const { Meat } = require("../assets/Meat.js")
const { Delivered } = require("../events/Delivered.js")
const { Paid } = require("../events/Paid.js")
const { PaidLate } = require("../events/PaidLate.js")
const { Disclosed } = require("../events/Disclosed.js")
const { Seller } = require("../roles/Seller.js")
const { Buyer } = require("../roles/Buyer.js")
const { Currency } = require("../types/Currency.js")
const { MeatQuality } = require("../types/MeatQuality.js")
const { SymboleoContract } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

class MeatSale extends SymboleoContract {
  constructor(buyer,seller,qnt,qlt,amt,curr,payDueDate,delAdd,effDate,delDueDateDays,interestRate) {
    super("MeatSale")
    this._name = "MeatSale"
    this.buyer = buyer
    this.seller = seller
    this.qnt = qnt
    this.qlt = qlt
    this.amt = amt
    this.curr = curr
    this.payDueDate = payDueDate
    this.delAdd = delAdd
    this.effDate = effDate
    this.delDueDateDays = delDueDateDays
    this.interestRate = interestRate
    
    this.obligations = {};
    this.survivingObligations = {};
    this.powers = {};
    
    // assign varaibles of the contract
    this.goods = new Meat("goods")
    this.goods.quantity = this.qnt
    this.goods.quality = this.qlt
    this.delivered = new Delivered("delivered")
    this.delivered.item = this.goods
    this.delivered.deliveryAddress = this.delAdd
    this.delivered.delDueDate = Utils.addTime(this.effDate, this.delDueDateDays, "days")
    this.paidLate = new PaidLate("paidLate")
    this.paidLate.amount = (1 + this.interestRate / 100) * this.amt
    this.paidLate.currency = this.curr
    this.paidLate.from = this.buyer
    this.paidLate.to = this.seller
    this.paid = new Paid("paid")
    this.paid.amount = this.amt
    this.paid.currency = this.curr
    this.paid.from = this.buyer
    this.paid.to = this.seller
    this.paid.payDueDate = this.payDueDate
    this.disclosed = new Disclosed("disclosed")
    
    // create instance of triggered obligations
    this.obligations.delivery = new Obligation('delivery', this.buyer, this.seller, this)
    this.obligations.payment = new Obligation('payment', this.seller, this.buyer, this)
  }
}

module.exports.MeatSale = MeatSale
