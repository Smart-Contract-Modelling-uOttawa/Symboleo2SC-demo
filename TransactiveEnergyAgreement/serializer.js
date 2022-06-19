const { TransactiveEnergyAgreement } = require("./domain/contract/TransactiveEnergyAgreement.js")
const { Obligation, ObligationActiveState, ObligationState } = require("symboleo-js-core")
const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleo-js-core")
const { Event } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { ContractState, ContractActiveState } = require("symboleo-js-core")
const { Events } = require("symboleo-js-core")
const { EventListeners, getEventMap } = require("./events.js")

function deserialize(data) {
  const object = JSON.parse(data)
  const contract = new TransactiveEnergyAgreement(object.caiso,object.derp)
  
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

  for (const key of ['bidAccepted','energySupplied','caisoTerminationNoticeIssued','terminationNoticeThirtyDays','derpTerminationNoticeIssued','terminationNoticeNinetyDays','creditInvoiceIssued','isoPaid','penaltyInvoiceIssued','paidPenalty']) {
    for(const eKey of Object.keys(object[key])) {
      contract[key][eKey] = object[key][eKey]
    }
  }

  if (object.obligations.paybyISO != null) {
    const obligation = new Obligation('paybyISO', contract.derp, contract.caiso, contract)
    obligation.state = object.obligations.paybyISO.state
    obligation.activeState = object.obligations.paybyISO.activeState
    obligation._createdPowerNames = object.obligations.paybyISO._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.paybyISO._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.paybyISO._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.paybyISO._events[eventType]._triggered
        eventObject._timestamp = object.obligations.paybyISO._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.paybyISO = obligation
  }
  if (object.obligations.supplyEnergy != null) {
    const obligation = new Obligation('supplyEnergy', contract.caiso, contract.derp, contract)
    obligation.state = object.obligations.supplyEnergy.state
    obligation.activeState = object.obligations.supplyEnergy.activeState
    obligation._createdPowerNames = object.obligations.supplyEnergy._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.supplyEnergy._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.supplyEnergy._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.supplyEnergy._events[eventType]._triggered
        eventObject._timestamp = object.obligations.supplyEnergy._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.supplyEnergy = obligation
  }
  if (object.obligations.payPenalty != null) {
    const obligation = new Obligation('payPenalty', contract.caiso, contract.derp, contract)
    obligation.state = object.obligations.payPenalty.state
    obligation.activeState = object.obligations.payPenalty.activeState
    obligation._createdPowerNames = object.obligations.payPenalty._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.payPenalty._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.payPenalty._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.payPenalty._events[eventType]._triggered
        eventObject._timestamp = object.obligations.payPenalty._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.payPenalty = obligation
  }

  
  if (object.powers.terminateAgreement != null) {
    const power = new Power('terminateAgreement', contract.caiso, contract.caiso, contract)
    power.state = object.powers.terminateAgreement.state
    power.activeState = object.powers.terminateAgreement.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.terminateAgreement._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.terminateAgreement._events[eventType]._triggered
        eventObject._timestamp = object.powers.terminateAgreement._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.terminateAgreement = power
  }
  if (object.powers.imposePenalty != null) {
    const power = new Power('imposePenalty', contract.caiso, contract.caiso, contract)
    power.state = object.powers.imposePenalty.state
    power.activeState = object.powers.imposePenalty.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.imposePenalty._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.imposePenalty._events[eventType]._triggered
        eventObject._timestamp = object.powers.imposePenalty._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.imposePenalty = power
  }
  if (object.powers.terminateAgreementBySupplier != null) {
    const power = new Power('terminateAgreementBySupplier', contract.derp, contract.derp, contract)
    power.state = object.powers.terminateAgreementBySupplier.state
    power.activeState = object.powers.terminateAgreementBySupplier.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.terminateAgreementBySupplier._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.terminateAgreementBySupplier._events[eventType]._triggered
        eventObject._timestamp = object.powers.terminateAgreementBySupplier._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.terminateAgreementBySupplier = power
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
