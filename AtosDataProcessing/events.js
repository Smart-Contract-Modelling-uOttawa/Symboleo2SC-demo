const { InternalEventSource, InternalEvent, InternalEventType } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Predicates } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")
const { OriginDataType } = require("./domain/types/OriginDataType.js")
const { RegionData } = require("./domain/types/RegionData.js")
const { CatSubjects } = require("./domain/types/CatSubjects.js")
const { CateProcessingAct } = require("./domain/types/CateProcessingAct.js")
const { DataType } = require("./domain/types/DataType.js")

const EventListeners = {
  createObligation_opaid(contract) { 
    if (Predicates.happens(contract.processedData)) {
      if (contract.obligations.opaid == null || contract.obligations.opaid.isFinished()) {
        contract.obligations.opaid = new Obligation('opaid', contract.atos, contract.client, contract)
        if (true) {
          contract.obligations.opaid.trigerredUnconditional()
          if (Predicates.happens(contract.paid)) {
            contract.obligations.opaid.fulfilled()
          }
        } else {
          contract.obligations.opaid.trigerredConditional()
        }
      }
    }
  },
  createObligation_odelRecord(contract) { 
    if (Predicates.happens(contract.requestedRecord)) {
      if (contract.obligations.odelRecord == null || contract.obligations.odelRecord.isFinished()) {
        contract.obligations.odelRecord = new Obligation('odelRecord', contract.client, contract.atos, contract)
        if (contract.requestedRecord.id===contract.dataPointId) {
          contract.obligations.odelRecord.trigerredUnconditional()
          if (Predicates.happens(contract.deliveredRecord)&&(contract.requestedRecord.id===contract.deliveredRecord.id)) {
            contract.obligations.odelRecord.fulfilled()
          }
        } else {
          contract.obligations.odelRecord.trigerredConditional()
        }
      }
    }
  },
  createObligation_orecordData(contract) { 
    if (Predicates.happens(contract.processedData)) {
      if (contract.obligations.orecordData == null || contract.obligations.orecordData.isFinished()) {
        contract.obligations.orecordData = new Obligation('orecordData', contract.client, contract.atos, contract)
        if (true) {
          contract.obligations.orecordData.trigerredUnconditional()
          if (Predicates.happens(contract.recoProcessedData)&&contract.processedData.id===contract.recoProcessedData.id&&contract.processedData.id===contract.dataPointId) {
            contract.obligations.orecordData.fulfilled()
          }
        } else {
          contract.obligations.orecordData.trigerredConditional()
        }
      }
    }
  },
  createObligation_oadaptInst(contract) { 
    if (Predicates.happens(contract.infringNotified)) {
      if (contract.obligations.oadaptInst == null || contract.obligations.oadaptInst.isFinished()) {
        contract.obligations.oadaptInst = new Obligation('oadaptInst', contract.atos, contract.client, contract)
        if (true) {
          contract.obligations.oadaptInst.trigerredUnconditional()
          if (Predicates.happens(contract.adaptedInst)) {
            contract.obligations.oadaptInst.fulfilled()
          }
        } else {
          contract.obligations.oadaptInst.trigerredConditional()
        }
      }
    }
  },
  createObligation_oproccDataInst(contract) { 
    if (Predicates.happens(contract.processedData)) {
      if (contract.obligations.oproccDataInst == null || contract.obligations.oproccDataInst.isFinished()) {
        contract.obligations.oproccDataInst = new Obligation('oproccDataInst', contract.atos, contract.client, contract)
        if (true) {
          contract.obligations.oproccDataInst.trigerredUnconditional()
          if (((contract.processedData.instruction.originData===contract.inst.originData)&&(contract.processedData.instruction.regionData===contract.inst.regionData)&&(contract.processedData.instruction.categoriesDataSubjects===contract.inst.categoriesDataSubjects)&&(contract.processedData.instruction.categoriesProcessingActivity===contract.inst.categoriesProcessingActivity)&&contract.dataPointId===contract.processedData.id)) {
            contract.obligations.oproccDataInst.fulfilled()
          }
        } else {
          contract.obligations.oproccDataInst.trigerredConditional()
        }
      }
    }
  },
  createPower_psuspendPerformance(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.oadaptInst && contract.obligations.oadaptInst._events.Violated)) {
      if (contract.powers.psuspendPerformance == null || contract.powers.psuspendPerformance.isFinished()){
        contract.powers.psuspendPerformance = new Power('psuspendPerformance', contract.atos, contract.client, contract)
        effects.powerCreated = true
        effects.powerName = 'psuspendPerformance'
        if (Predicates.happens(contract.suspendNoticed)) {
          contract.powers.psuspendPerformance.trigerredUnconditional()
        } else {
          contract.powers.psuspendPerformance.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_presumPerformance(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.modifiedInst)) {
      if (contract.powers.presumPerformance == null || contract.powers.presumPerformance.isFinished()){
        contract.powers.presumPerformance = new Power('presumPerformance', contract.client, contract.atos, contract)
        effects.powerCreated = true
        effects.powerName = 'presumPerformance'
        if (true) {
          contract.powers.presumPerformance.trigerredUnconditional()
        } else {
          contract.powers.presumPerformance.trigerredConditional()
        }
      }
    }
    return effects
  },
  activatePower_psuspendPerformance(contract) { 
    if (contract.powers.psuspendPerformance != null && (Predicates.happens(contract.suspendNoticed))) {
      contract.powers.psuspendPerformance.activated()
    }
  },
  fulfillObligation_opaid(contract) { 
    if (contract.obligations.opaid != null && (Predicates.happens(contract.paid))) {
      contract.obligations.opaid.fulfilled()
    }
  },
  fulfillObligation_odelRecord(contract) { 
    if (contract.obligations.odelRecord != null && (Predicates.happens(contract.deliveredRecord)&&(contract.requestedRecord.id===contract.deliveredRecord.id))) {
      contract.obligations.odelRecord.fulfilled()
    }
  },
  fulfillObligation_oproccData(contract) { 
    if (contract.obligations.oproccData != null && (Predicates.happens(contract.processedData))) {
      contract.obligations.oproccData.fulfilled()
    }
  },
  fulfillObligation_orecordData(contract) { 
    if (contract.obligations.orecordData != null && (Predicates.happens(contract.recoProcessedData)&&contract.processedData.id===contract.recoProcessedData.id&&contract.processedData.id===contract.dataPointId)) {
      contract.obligations.orecordData.fulfilled()
    }
  },
  fulfillObligation_oadaptInst(contract) { 
    if (contract.obligations.oadaptInst != null && (Predicates.happens(contract.adaptedInst))) {
      contract.obligations.oadaptInst.fulfilled()
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
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), ], EventListeners.createObligation_opaid],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.requestedRecord), ], EventListeners.createObligation_odelRecord],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), ], EventListeners.createObligation_orecordData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.infringNotified), ], EventListeners.createObligation_oadaptInst],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), ], EventListeners.createObligation_oproccDataInst],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.oadaptInst), ], EventListeners.createPower_psuspendPerformance],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.modifiedInst), ], EventListeners.createPower_presumPerformance],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.suspendNoticed), ], EventListeners.activatePower_psuspendPerformance],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid), ], EventListeners.fulfillObligation_opaid],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.deliveredRecord), ], EventListeners.fulfillObligation_odelRecord],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), ], EventListeners.fulfillObligation_oproccData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.recoProcessedData), ], EventListeners.fulfillObligation_orecordData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.adaptedInst), ], EventListeners.fulfillObligation_oadaptInst],
  ]
}

module.exports.EventListeners = EventListeners
module.exports.getEventMap = getEventMap
