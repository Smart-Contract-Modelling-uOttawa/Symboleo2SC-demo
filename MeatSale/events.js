const { InternalEventSource, InternalEvent, InternalEventType } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Predicates } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")
const { Currency } = require("./domain/types/Currency.js")
const { MeatQuality } = require("./domain/types/MeatQuality.js")

const EventListeners = {
  createObligation_latePayment(contract) { 
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated)) {
      if (contract.obligations.latePayment == null || contract.obligations.latePayment.isFinished()) {
        const isNewInstance =  contract.obligations.latePayment != null && contract.obligations.latePayment.isFinished()
        contract.obligations.latePayment = new Obligation('latePayment', contract.seller, contract.buyer, contract)
        if (true) {
          contract.obligations.latePayment.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.paidLate)) {
            contract.obligations.latePayment.fulfilled()
          }
        } else {
          contract.obligations.latePayment.trigerredConditional()
        }
      }
    }
  },
  createPower_suspendDelivery(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated)) {
      if (contract.powers.suspendDelivery == null || contract.powers.suspendDelivery.isFinished()){
        const isNewInstance =  contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isFinished()
        contract.powers.suspendDelivery = new Power('suspendDelivery', contract.seller, contract.buyer, contract)
        effects.powerCreated = true
        effects.powerName = 'suspendDelivery'
        if (true) {
          contract.powers.suspendDelivery.trigerredUnconditional()
        } else {
          contract.powers.suspendDelivery.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_terminateContract(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.delivery && contract.obligations.delivery._events.Violated)) {
      if (contract.powers.terminateContract == null || contract.powers.terminateContract.isFinished()){
        const isNewInstance =  contract.powers.terminateContract != null && contract.powers.terminateContract.isFinished()
        contract.powers.terminateContract = new Power('terminateContract', contract.buyer, contract.seller, contract)
        effects.powerCreated = true
        effects.powerName = 'terminateContract'
        if (true) {
          contract.powers.terminateContract.trigerredUnconditional()
        } else {
          contract.powers.terminateContract.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_resumeDelivery(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happensWithin(contract.paidLate, contract.obligations.delivery, "Obligation.Suspension")) {
      if (contract.powers.resumeDelivery == null || contract.powers.resumeDelivery.isFinished()){
        const isNewInstance =  contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.isFinished()
        contract.powers.resumeDelivery = new Power('resumeDelivery', contract.buyer, contract.seller, contract)
        effects.powerCreated = true
        effects.powerName = 'resumeDelivery'
        if (true) {
          contract.powers.resumeDelivery.trigerredUnconditional()
        } else {
          contract.powers.resumeDelivery.trigerredConditional()
        }
      }
    }
    return effects
  },
  fulfillObligation_delivery(contract) { 
    if (contract.obligations.delivery != null && (Predicates.weakHappensBefore(contract.delivered, contract.delivered.delDueDate))) {
      contract.obligations.delivery.fulfilled()
    }
  },
  fulfillObligation_latePayment(contract) { 
    if (contract.obligations.latePayment != null && (Predicates.happens(contract.paidLate))) {
      contract.obligations.latePayment.fulfilled()
    }
  },
  fulfillObligation_payment(contract) { 
    if (contract.obligations.payment != null && (Predicates.weakHappensBefore(contract.paid, contract.paid.payDueDate))) {
      contract.obligations.payment.fulfilled()
    }
  },
  successfullyTerminateContract(contract) {
    for (const oblKey of Object.keys(contract.obligations)) {
      if (contract.obligations[oblKey].isActive()) {
        return;
      }
      if (contract.obligations[oblKey].isViolated() && Array.isArray(contract.obligations[oblKey]._createdPowerNames)) {
        for (const pKey of contract.obligations[oblKey]._createdPowerNames) {
          if (!contract.powers[pKey].isSuccessfulTermination()) {
            return;
          }
        }
      }
    }
    contract.fulfilledActiveObligations()
  },
  unsuccessfullyTerminateContract(contract) {
    for (let index in contract.obligations) { 
      contract.obligations[index].terminated({emitEvent: false})
    }
    for (let index in contract.powers) {
      contract.powers[index].terminated()
    }
    contract.terminated()
  }     
}

function getEventMap(contract) {
  return [
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payment), ], EventListeners.createObligation_latePayment],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payment), ], EventListeners.createPower_suspendDelivery],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.delivery), ], EventListeners.createPower_terminateContract],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.createPower_resumeDelivery],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered), ], EventListeners.fulfillObligation_delivery],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.fulfillObligation_latePayment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid), ], EventListeners.fulfillObligation_payment],
  ]
}

module.exports.EventListeners = EventListeners
module.exports.getEventMap = getEventMap
