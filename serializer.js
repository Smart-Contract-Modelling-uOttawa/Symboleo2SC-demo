const { MeatSale } = require("./domain/contract/MeatSale.js")
const { Obligation, ObligationActiveState, ObligationState } = require("symboleo-js-core")
const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleo-js-core")
const { Event } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { ContractState, ContractActiveState } = require("symboleo-js-core")
const { Events } = require("symboleo-js-core")
const { EventListeners, getEventMap } = require("./events.js")

function deserialize(data) {
  const object = JSON.parse(data)
  const contract = new MeatSale(object.buyer,object.seller,object.qnt,object.qlt,object.amt,object.curr,object.payDueDate,object.delAdd,object.effDate,object.delDueDateDays,object.interestRate)
  
  contract.state = object.state
  contract.activeState = object.activeState
  
  for (const eventType of Object.keys(InternalEventType.contract)) {
    if (object._events[eventType] != null) {
      const eventObject = new Event()
      eventObject._triggered = object._events[eventType]._triggered
      eventObject._timestamp = object._events[eventType]._timestamp
      contract._events[eventType] = eventObject
    }
  }

  for (const key of ['delivered','paidLate','paid']) {
    if (object[key]._triggered === true) {
      contract[key]._triggered = true
      contract[key]._timestamp = object[key]._timestamp
    }
  }

  if (object.obligations.latePayment != null) {
    const obligation = new Obligation('latePayment', contract.seller, contract.buyer, contract)
    obligation.state = object.obligations.latePayment.state
    obligation.activeState = object.obligations.latePayment.activeState
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.latePayment._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.latePayment._events[eventType]._triggered
        eventObject._timestamp = object.obligations.latePayment._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.latePayment = obligation
  }
  if (object.obligations.delivery != null) {
    const obligation = new Obligation('delivery', contract.buyer, contract.seller, contract)
    obligation.state = object.obligations.delivery.state
    obligation.activeState = object.obligations.delivery.activeState
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.delivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.delivery._events[eventType]._triggered
        eventObject._timestamp = object.obligations.delivery._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.delivery = obligation
  }
  if (object.obligations.payment != null) {
    const obligation = new Obligation('payment', contract.seller, contract.buyer, contract)
    obligation.state = object.obligations.payment.state
    obligation.activeState = object.obligations.payment.activeState
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.payment._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.payment._events[eventType]._triggered
        eventObject._timestamp = object.obligations.payment._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.payment = obligation
  }

  
  if (object.powers.suspendDelivery != null) {
    const power = new Power('suspendDelivery', contract.seller, contract.seller, contract)
    power.state = object.powers.suspendDelivery.state
    power.activeState = object.powers.suspendDelivery.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.suspendDelivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.suspendDelivery._events[eventType]._triggered
        eventObject._timestamp = object.powers.suspendDelivery._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.suspendDelivery = power
  }
  if (object.powers.resumeDelivery != null) {
    const power = new Power('resumeDelivery', contract.buyer, contract.buyer, contract)
    power.state = object.powers.resumeDelivery.state
    power.activeState = object.powers.resumeDelivery.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.resumeDelivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.resumeDelivery._events[eventType]._triggered
        eventObject._timestamp = object.powers.resumeDelivery._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.resumeDelivery = power
  }
  if (object.powers.terminateContract != null) {
    const power = new Power('terminateContract', contract.buyer, contract.buyer, contract)
    power.state = object.powers.terminateContract.state
    power.activeState = object.powers.terminateContract.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.terminateContract._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.terminateContract._events[eventType]._triggered
        eventObject._timestamp = object.powers.terminateContract._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.terminateContract = power
  }
  return contract
}

function serialize(contract) {
  for (const key of Object.keys(contract.obligations)){
    contract.obligations[key].contract = undefined
    contract.obligations[key].creditor = undefined
    contract.obligations[key].debtor = undefined
  }

  for (const key of Object.keys(contract.powers)){
    contract.powers[key].contract = undefined
    contract.powers[key].creditor = undefined
    contract.powers[key].debtor = undefined
  }

  for (const key of Object.keys(contract.survivingObligations)){
    contract.survivingObligations[key].contract = undefined
    contract.survivingObligations[key].creditor = undefined
    contract.survivingObligations[key].debtor = undefined
  }

  return JSON.stringify(contract)
}

module.exports.deserialize = deserialize
module.exports.serialize = serialize
