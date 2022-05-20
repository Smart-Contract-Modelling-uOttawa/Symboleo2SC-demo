const { InternalEventSource, InternalEvent, InternalEventType } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Predicates } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

const EventListeners = {
  createObligation_supplyEnergy(contract) { 
    if (Predicates.happens(contract.bidAccepted)) {
      if (contract.obligations.supplyEnergy == null || contract.obligations.supplyEnergy.isFinished()) {
        contract.obligations.supplyEnergy = new Obligation('supplyEnergy', contract.caiso, contract.derp, contract)
        if (true) {
          contract.obligations.supplyEnergy.trigerredUnconditional()
          if (Predicates.happens(contract.energySupplied)&&contract.energySupplied.dispatchStartTime<=contract.bidAccepted.bid.dispatchStartTime&&contract.energySupplied.dispatchEndTime<=contract.bidAccepted.bid.dispatchEndTime&&contract.energySupplied.voltage>=contract.bidAccepted.bid.instruction.minVoltage&&contract.energySupplied.voltage<=contract.bidAccepted.bid.instruction.maxVoltage) {
            contract.obligations.supplyEnergy.fulfilled()
          }
        } else {
          contract.obligations.supplyEnergy.trigerredConditional()
        }
      }
    }
  },
  createObligation_payPenalty(contract) { 
    if (Predicates.happens(contract.powers.imposePenalty && contract.powers.imposePenalty._events.Exerted)) {
      if (contract.obligations.payPenalty == null || contract.obligations.payPenalty.isFinished()) {
        contract.obligations.payPenalty = new Obligation('payPenalty', contract.caiso, contract.derp, contract)
        if (true) {
          contract.obligations.payPenalty.trigerredUnconditional()
          if (Predicates.happens(contract.penaltyInvoiceIssued)&&Predicates.strongHappensBefore(contract.paidPenalty, Utils.addTime(contract.penaltyInvoiceIssued._timestamp, 4, "days"))) {
            contract.obligations.payPenalty.fulfilled()
          }
        } else {
          contract.obligations.payPenalty.trigerredConditional()
        }
      }
    }
  },
  createObligation_paybyISO(contract) { 
    if (Predicates.happens(contract.obligations.supplyEnergy && contract.obligations.supplyEnergy._events.Fulfilled)) {
      if (contract.obligations.paybyISO == null || contract.obligations.paybyISO.isFinished()) {
        contract.obligations.paybyISO = new Obligation('paybyISO', contract.derp, contract.caiso, contract)
        if (true) {
          contract.obligations.paybyISO.trigerredUnconditional()
          if (Predicates.happens(contract.creditInvoiceIssued)&&Predicates.happensWithin(contract.isoPaid, contract.creditInvoiceIssued._timestamp, Utils.addTime(contract.creditInvoiceIssued._timestamp, 4, "days"))) {
            contract.obligations.paybyISO.fulfilled()
          }
        } else {
          contract.obligations.paybyISO.trigerredConditional()
        }
      }
    }
  },
  createPower_terminateAgreement(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.payPenalty && contract.obligations.payPenalty._events.Violated)) {
      if (contract.powers.terminateAgreement == null || contract.powers.terminateAgreement.isFinished()){
        contract.powers.terminateAgreement = new Power('terminateAgreement', contract.caiso, contract.derp, contract)
        effects.powerCreated = true
        effects.powerName = 'terminateAgreement'
        if (Predicates.happens(contract.caisoTerminationNoticeIssued)) {
          contract.powers.terminateAgreement.trigerredUnconditional()
        } else {
          contract.powers.terminateAgreement.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_imposePenalty(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.supplyEnergy && contract.obligations.supplyEnergy._events.Violated)) {
      if (contract.powers.imposePenalty == null || contract.powers.imposePenalty.isFinished()){
        contract.powers.imposePenalty = new Power('imposePenalty', contract.caiso, contract.derp, contract)
        effects.powerCreated = true
        effects.powerName = 'imposePenalty'
        if (true) {
          contract.powers.imposePenalty.trigerredUnconditional()
        } else {
          contract.powers.imposePenalty.trigerredConditional()
        }
      }
    }
    return effects
  },
  activatePower_terminateAgreement(contract) { 
    if (contract.powers.terminateAgreement != null && (Predicates.happens(contract.caisoTerminationNoticeIssued))) {
      contract.powers.terminateAgreement.activated()
    }
  },
  activatePower_terminateAgreementBySupplier(contract) { 
    if (contract.powers.terminateAgreementBySupplier != null && (Predicates.happens(contract.derpTerminationNoticeIssued))) {
      contract.powers.terminateAgreementBySupplier.activated()
    }
  },
  fulfillObligation_supplyEnergy(contract) { 
    if (contract.obligations.supplyEnergy != null && (Predicates.happens(contract.energySupplied)&&contract.energySupplied.dispatchStartTime<=contract.bidAccepted.bid.dispatchStartTime&&contract.energySupplied.dispatchEndTime<=contract.bidAccepted.bid.dispatchEndTime&&contract.energySupplied.voltage>=contract.bidAccepted.bid.instruction.minVoltage&&contract.energySupplied.voltage<=contract.bidAccepted.bid.instruction.maxVoltage)) {
      contract.obligations.supplyEnergy.fulfilled()
    }
  },
  fulfillObligation_payPenalty(contract) { 
    if (contract.obligations.payPenalty != null && (Predicates.happens(contract.penaltyInvoiceIssued)&&Predicates.strongHappensBefore(contract.paidPenalty, Utils.addTime(contract.penaltyInvoiceIssued._timestamp, 4, "days")))) {
      contract.obligations.payPenalty.fulfilled()
    }
  },
  fulfillObligation_paybyISO(contract) { 
    if (contract.obligations.paybyISO != null && (Predicates.happens(contract.creditInvoiceIssued)&&Predicates.happensWithin(contract.isoPaid, contract.creditInvoiceIssued._timestamp, Utils.addTime(contract.creditInvoiceIssued._timestamp, 4, "days")))) {
      contract.obligations.paybyISO.fulfilled()
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
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.bidAccepted), ], EventListeners.createObligation_supplyEnergy],
    [[new InternalEvent(InternalEventSource.power, InternalEventType.power.Exerted, contract.powers.imposePenalty), ], EventListeners.createObligation_payPenalty],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Fulfilled, contract.obligations.supplyEnergy), ], EventListeners.createObligation_paybyISO],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payPenalty), ], EventListeners.createPower_terminateAgreement],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.supplyEnergy), ], EventListeners.createPower_imposePenalty],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.caisoTerminationNoticeIssued), ], EventListeners.activatePower_terminateAgreement],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.derpTerminationNoticeIssued), ], EventListeners.activatePower_terminateAgreementBySupplier],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.energySupplied), ], EventListeners.fulfillObligation_supplyEnergy],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.penaltyInvoiceIssued), new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidPenalty), ], EventListeners.fulfillObligation_payPenalty],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.creditInvoiceIssued), new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.isoPaid), ], EventListeners.fulfillObligation_paybyISO],
  ]
}

module.exports.EventListeners = EventListeners
module.exports.getEventMap = getEventMap
