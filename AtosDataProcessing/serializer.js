const { DataProcessingAgreement } = require("./domain/contract/DataProcessingAgreement.js")
const { Obligation, ObligationActiveState, ObligationState } = require("symboleo-js-core")
const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleo-js-core")
const { Event } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { ContractState, ContractActiveState } = require("symboleo-js-core")
const { Events } = require("symboleo-js-core")
const { EventListeners, getEventMap } = require("./events.js")

function deserialize(data) {
  const object = JSON.parse(data)
  const contract = new DataProcessingAgreement(object.atos, object.client, object.instruction)
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

  for (const key of ['requestedDataProcessing', 'processedData', 'recoProcessedData', 'requestedRecordOfProcessing', 'deliveredRecordOfProcessing', 'adaptedInstruction', 'infringementNotified', 'suspensionNotified', 'clientAgreedTermination', 'providerAgreedTermination', 'paidServiceProvider', 'requestedPayment']) {
    for(const eKey of Object.keys(object[key])) {
      contract[key][eKey] = object[key][eKey]
    }
  }

  if (object.obligations.payment != null) {
    const obligation = new Obligation('payment', contract.atos, contract.client, contract)
    obligation.state = object.obligations.payment.state
    obligation.activeState = object.obligations.payment.activeState
    obligation._createdPowerNames = object.obligations.payment._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.payment._suspendedByContractSuspension
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
  if (object.obligations.processData != null) {
    const obligation = new Obligation('processData', contract.client, contract.atos, contract)
    obligation.state = object.obligations.processData.state
    obligation.activeState = object.obligations.processData.activeState
    obligation._createdPowerNames = object.obligations.processData._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.processData._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.processData._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.processData._events[eventType]._triggered
        eventObject._timestamp = object.obligations.processData._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.processData = obligation
  }
  if (object.obligations.adaptInstruction != null) {
    const obligation = new Obligation('adaptInstruction', contract.atos, contract.client, contract)
    obligation.state = object.obligations.adaptInstruction.state
    obligation.activeState = object.obligations.adaptInstruction.activeState
    obligation._createdPowerNames = object.obligations.adaptInstruction._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.adaptInstruction._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.adaptInstruction._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.adaptInstruction._events[eventType]._triggered
        eventObject._timestamp = object.obligations.adaptInstruction._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.adaptInstruction = obligation
  }
  if (object.obligations.recordData != null) {
    const obligation = new Obligation('recordData', contract.client, contract.atos, contract)
    obligation.state = object.obligations.recordData.state
    obligation.activeState = object.obligations.recordData.activeState
    obligation._createdPowerNames = object.obligations.recordData._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.recordData._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.recordData._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.recordData._events[eventType]._triggered
        eventObject._timestamp = object.obligations.recordData._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.recordData = obligation
  }
  if (object.obligations.deliverProcessingRecord != null) {
    const obligation = new Obligation('deliverProcessingRecord', contract.client, contract.atos, contract)
    obligation.state = object.obligations.deliverProcessingRecord.state
    obligation.activeState = object.obligations.deliverProcessingRecord.activeState
    obligation._createdPowerNames = object.obligations.deliverProcessingRecord._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.deliverProcessingRecord._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.deliverProcessingRecord._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.deliverProcessingRecord._events[eventType]._triggered
        eventObject._timestamp = object.obligations.deliverProcessingRecord._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.deliverProcessingRecord = obligation
  }
  if (object.obligations.provideDataProcessingService != null) {
    const obligation = new Obligation('provideDataProcessingService', contract.client, contract.atos, contract)
    obligation.state = object.obligations.provideDataProcessingService.state
    obligation.activeState = object.obligations.provideDataProcessingService.activeState
    obligation._createdPowerNames = object.obligations.provideDataProcessingService._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.provideDataProcessingService._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.provideDataProcessingService._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.provideDataProcessingService._events[eventType]._triggered
        eventObject._timestamp = object.obligations.provideDataProcessingService._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.provideDataProcessingService = obligation
  }

  
  if (object.powers.suspendService != null) {
    const power = new Power('suspendService', contract.atos, contract.atos, contract)
    power.state = object.powers.suspendService.state
    power.activeState = object.powers.suspendService.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.suspendService._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.suspendService._events[eventType]._triggered
        eventObject._timestamp = object.powers.suspendService._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.suspendService = power
  }
  if (object.powers.suspendActiveRequest != null) {
    const power = new Power('suspendActiveRequest', contract.atos, contract.atos, contract)
    power.state = object.powers.suspendActiveRequest.state
    power.activeState = object.powers.suspendActiveRequest.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.suspendActiveRequest._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.suspendActiveRequest._events[eventType]._triggered
        eventObject._timestamp = object.powers.suspendActiveRequest._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.suspendActiveRequest = power
  }
  if (object.powers.resumeService != null) {
    const power = new Power('resumeService', contract.client, contract.client, contract)
    power.state = object.powers.resumeService.state
    power.activeState = object.powers.resumeService.activeState
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.resumeService._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.resumeService._events[eventType]._triggered
        eventObject._timestamp = object.powers.resumeService._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.resumeService = power
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
