const { AtosDataProcessing } = require("./domain/contract/AtosDataProcessing.js")
const { Obligation, ObligationActiveState, ObligationState } = require("symboleo-js-core")
const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleo-js-core")
const { Event } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { ContractState, ContractActiveState } = require("symboleo-js-core")
const { Events } = require("symboleo-js-core")
const { EventListeners, getEventMap } = require("./events.js")

function deserialize(data) {
  const object = JSON.parse(data)
  const contract = new AtosDataProcessing(object.atos,object.client,object.inst,object.dType,object.dataPointId)
  
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

  for (const key of ['processedData','adaptedInst','infringNotified','suspendNoticed','modifiedInst','recoProcessedData','paid','deliveredRecord','requestedRecord']) {
    for(const eKey of Object.keys(object[key])) {
      contract[key][eKey] = object[key][eKey]
    }
  }

  if (object.obligations.oproccDataInst != null) {
    const obligation = new Obligation('oproccDataInst', contract.atos, contract.client, contract)
    obligation.state = object.obligations.oproccDataInst.state
    obligation.activeState = object.obligations.oproccDataInst.activeState
    obligation._createdPowerNames = object.obligations.oproccDataInst._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.oproccDataInst._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.oproccDataInst._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.oproccDataInst._events[eventType]._triggered
        eventObject._timestamp = object.obligations.oproccDataInst._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.oproccDataInst = obligation
  }
  if (object.obligations.oadaptInst != null) {
    const obligation = new Obligation('oadaptInst', contract.atos, contract.client, contract)
    obligation.state = object.obligations.oadaptInst.state
    obligation.activeState = object.obligations.oadaptInst.activeState
    obligation._createdPowerNames = object.obligations.oadaptInst._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.oadaptInst._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.oadaptInst._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.oadaptInst._events[eventType]._triggered
        eventObject._timestamp = object.obligations.oadaptInst._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.oadaptInst = obligation
  }
  if (object.obligations.orecordData != null) {
    const obligation = new Obligation('orecordData', contract.client, contract.atos, contract)
    obligation.state = object.obligations.orecordData.state
    obligation.activeState = object.obligations.orecordData.activeState
    obligation._createdPowerNames = object.obligations.orecordData._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.orecordData._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.orecordData._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.orecordData._events[eventType]._triggered
        eventObject._timestamp = object.obligations.orecordData._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.orecordData = obligation
  }
  if (object.obligations.opaid != null) {
    const obligation = new Obligation('opaid', contract.atos, contract.client, contract)
    obligation.state = object.obligations.opaid.state
    obligation.activeState = object.obligations.opaid.activeState
    obligation._createdPowerNames = object.obligations.opaid._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.opaid._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.opaid._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.opaid._events[eventType]._triggered
        eventObject._timestamp = object.obligations.opaid._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.opaid = obligation
  }
  if (object.obligations.odelRecord != null) {
    const obligation = new Obligation('odelRecord', contract.client, contract.atos, contract)
    obligation.state = object.obligations.odelRecord.state
    obligation.activeState = object.obligations.odelRecord.activeState
    obligation._createdPowerNames = object.obligations.odelRecord._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.odelRecord._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.odelRecord._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.odelRecord._events[eventType]._triggered
        eventObject._timestamp = object.obligations.odelRecord._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.odelRecord = obligation
  }
  if (object.obligations.oproccData != null) {
    const obligation = new Obligation('oproccData', contract.client, contract.atos, contract)
    obligation.state = object.obligations.oproccData.state
    obligation.activeState = object.obligations.oproccData.activeState
    obligation._createdPowerNames = object.obligations.oproccData._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.oproccData._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.oproccData._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.oproccData._events[eventType]._triggered
        eventObject._timestamp = object.obligations.oproccData._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.oproccData = obligation
  }

  
  if (object.powers.psuspendPerformance != null) {
    const power = new Power('psuspendPerformance', contract.atos, contract.atos, contract)
    power.state = object.powers.psuspendPerformance.state
    power.activeState = object.powers.psuspendPerformance.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.psuspendPerformance._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.psuspendPerformance._events[eventType]._triggered
        eventObject._timestamp = object.powers.psuspendPerformance._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.psuspendPerformance = power
  }
  if (object.powers.presumPerformance != null) {
    const power = new Power('presumPerformance', contract.client, contract.client, contract)
    power.state = object.powers.presumPerformance.state
    power.activeState = object.powers.presumPerformance.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.presumPerformance._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.presumPerformance._events[eventType]._triggered
        eventObject._timestamp = object.powers.presumPerformance._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.presumPerformance = power
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
