const { InternalEventSource, InternalEvent, InternalEventType } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Predicates } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")
const { Origin } = require("./domain/types/Origin.js")
const { Region } = require("./domain/types/Region.js")
const { CategorySubjects } = require("./domain/types/CategorySubjects.js")
const { ProcessingActitvity } = require("./domain/types/ProcessingActitvity.js")

const EventListeners = {
  createObligation_processData(contract) { 
    if (Predicates.happens(contract.requestedDataProcessing) ) { 
      if (contract.obligations.processData == null || contract.obligations.processData.isFinished()) {
        const isNewInstance =  contract.obligations.processData != null && contract.obligations.processData.isFinished()
        contract.obligations.processData = new Obligation('processData', contract.client, contract.atos, contract)
        if (true ) { 
          contract.obligations.processData.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.processedData)  && ((Predicates.happens(contract.adaptedInstruction)  && contract.processedData.instruction.origin === contract.adaptedInstruction.instruction.origin && contract.processedData.instruction.region === contract.adaptedInstruction.instruction.region && contract.processedData.instruction.categorySubjects === contract.adaptedInstruction.instruction.categorySubjects && contract.processedData.instruction.processingActitvity === contract.adaptedInstruction.instruction.processingActitvity && contract.processedData.dataId === contract.requestedDataProcessing.dataPoint.id) || (contract.processedData.instruction.origin === contract.instruction.origin && contract.processedData.instruction.region === contract.instruction.region && contract.processedData.instruction.categorySubjects === contract.instruction.categorySubjects && contract.processedData.instruction.processingActitvity === contract.instruction.processingActitvity && contract.processedData.dataId === contract.requestedDataProcessing.dataPoint.id))) { 
            contract.obligations.processData.fulfilled()
          }
        } else {
          contract.obligations.processData.trigerredConditional()
        }
      }
    }
  },
  createObligation_adaptInstruction(contract) { 
    if (Predicates.happens(contract.infringementNotified) ) { 
      if (contract.obligations.adaptInstruction == null || contract.obligations.adaptInstruction.isFinished()) {
        const isNewInstance =  contract.obligations.adaptInstruction != null && contract.obligations.adaptInstruction.isFinished()
        contract.obligations.adaptInstruction = new Obligation('adaptInstruction', contract.atos, contract.client, contract)
        if (true ) { 
          contract.obligations.adaptInstruction.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.adaptedInstruction) ) { 
            contract.obligations.adaptInstruction.fulfilled()
          }
        } else {
          contract.obligations.adaptInstruction.trigerredConditional()
        }
      }
    }
  },
  createObligation_recordData(contract) { 
    if (Predicates.happens(contract.processedData) ) { 
      if (contract.obligations.recordData == null || contract.obligations.recordData.isFinished()) {
        const isNewInstance =  contract.obligations.recordData != null && contract.obligations.recordData.isFinished()
        contract.obligations.recordData = new Obligation('recordData', contract.client, contract.atos, contract)
        if (true ) { 
          contract.obligations.recordData.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.recoProcessedData)  && contract.processedData.dataId === contract.recoProcessedData.dataId) { 
            contract.obligations.recordData.fulfilled()
          }
        } else {
          contract.obligations.recordData.trigerredConditional()
        }
      }
    }
  },
  createObligation_payment(contract) { 
    if (Predicates.happens(contract.requestedPayment) ) { 
      if (contract.obligations.payment == null || contract.obligations.payment.isFinished()) {
        const isNewInstance =  contract.obligations.payment != null && contract.obligations.payment.isFinished()
        contract.obligations.payment = new Obligation('payment', contract.atos, contract.client, contract)
        if (true ) { 
          contract.obligations.payment.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.paidServiceProvider)  && contract.requestedPayment.amount === contract.paidServiceProvider.amount) { 
            contract.obligations.payment.fulfilled()
          }
        } else {
          contract.obligations.payment.trigerredConditional()
        }
      }
    }
  },
  createObligation_deliverProcessingRecord(contract) { 
    if (Predicates.happens(contract.requestedRecordOfProcessing) ) { 
      if (contract.obligations.deliverProcessingRecord == null || contract.obligations.deliverProcessingRecord.isFinished()) {
        const isNewInstance =  contract.obligations.deliverProcessingRecord != null && contract.obligations.deliverProcessingRecord.isFinished()
        contract.obligations.deliverProcessingRecord = new Obligation('deliverProcessingRecord', contract.client, contract.atos, contract)
        if (true ) { 
          contract.obligations.deliverProcessingRecord.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.deliveredRecordOfProcessing)  && (contract.requestedRecordOfProcessing.dataId === contract.deliveredRecordOfProcessing.dataId)) { 
            contract.obligations.deliverProcessingRecord.fulfilled()
          }
        } else {
          contract.obligations.deliverProcessingRecord.trigerredConditional()
        }
      }
    }
  },
  createPower_suspendService(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.adaptInstruction && contract.obligations.adaptInstruction._events.Violated) ) { 
      if (contract.powers.suspendService == null || contract.powers.suspendService.isFinished()){
        const isNewInstance =  contract.powers.suspendService != null && contract.powers.suspendService.isFinished()
        contract.powers.suspendService = new Power('suspendService', contract.atos, contract.client, contract)
        effects.powerCreated = true
        effects.powerName = 'suspendService'
        if (!isNewInstance && Predicates.happens(contract.suspensionNotified)  ) { 
          contract.powers.suspendService.trigerredUnconditional()
        } else {
          contract.powers.suspendService.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_suspendActiveRequest(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.adaptInstruction && contract.obligations.adaptInstruction._events.Violated) ) { 
      if (contract.powers.suspendActiveRequest == null || contract.powers.suspendActiveRequest.isFinished()){
        const isNewInstance =  contract.powers.suspendActiveRequest != null && contract.powers.suspendActiveRequest.isFinished()
        contract.powers.suspendActiveRequest = new Power('suspendActiveRequest', contract.atos, contract.client, contract)
        effects.powerCreated = true
        effects.powerName = 'suspendActiveRequest'
        if (!isNewInstance && Predicates.happens(contract.suspensionNotified)  ) { 
          contract.powers.suspendActiveRequest.trigerredUnconditional()
        } else {
          contract.powers.suspendActiveRequest.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_resumeService(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.adaptedInstruction) ) { 
      if (contract.powers.resumeService == null || contract.powers.resumeService.isFinished()){
        const isNewInstance =  contract.powers.resumeService != null && contract.powers.resumeService.isFinished()
        contract.powers.resumeService = new Power('resumeService', contract.client, contract.atos, contract)
        effects.powerCreated = true
        effects.powerName = 'resumeService'
        if (true ) { 
          contract.powers.resumeService.trigerredUnconditional()
        } else {
          contract.powers.resumeService.trigerredConditional()
        }
      }
    }
    return effects
  },
  activatePower_suspendService(contract) { 
    if (contract.powers.suspendService != null && (Predicates.happens(contract.suspensionNotified) )) {  
      contract.powers.suspendService.activated()
    }
  },
  activatePower_suspendActiveRequest(contract) { 
    if (contract.powers.suspendActiveRequest != null && (Predicates.happens(contract.suspensionNotified) )) {  
      contract.powers.suspendActiveRequest.activated()
    }
  },
  fulfillObligation_processData(contract) { 
    if (contract.obligations.processData != null && (Predicates.happens(contract.processedData)  && ((Predicates.happens(contract.adaptedInstruction)  && contract.processedData.instruction.origin === contract.adaptedInstruction.instruction.origin && contract.processedData.instruction.region === contract.adaptedInstruction.instruction.region && contract.processedData.instruction.categorySubjects === contract.adaptedInstruction.instruction.categorySubjects && contract.processedData.instruction.processingActitvity === contract.adaptedInstruction.instruction.processingActitvity && contract.processedData.dataId === contract.requestedDataProcessing.dataPoint.id) || (contract.processedData.instruction.origin === contract.instruction.origin && contract.processedData.instruction.region === contract.instruction.region && contract.processedData.instruction.categorySubjects === contract.instruction.categorySubjects && contract.processedData.instruction.processingActitvity === contract.instruction.processingActitvity && contract.processedData.dataId === contract.requestedDataProcessing.dataPoint.id))) ) { 
      contract.obligations.processData.fulfilled()
    }
  },
  fulfillObligation_provideDataProcessingService(contract) { 
    if (contract.obligations.provideDataProcessingService != null && (Predicates.happens(contract.clientAgreedTermination)  && Predicates.happens(contract.providerAgreedTermination) ) ) { 
      contract.obligations.provideDataProcessingService.fulfilled()
    }
  },
  fulfillObligation_adaptInstruction(contract) { 
    if (contract.obligations.adaptInstruction != null && (Predicates.happens(contract.adaptedInstruction) ) ) { 
      contract.obligations.adaptInstruction.fulfilled()
    }
  },
  fulfillObligation_recordData(contract) { 
    if (contract.obligations.recordData != null && (Predicates.happens(contract.recoProcessedData)  && contract.processedData.dataId === contract.recoProcessedData.dataId) ) { 
      contract.obligations.recordData.fulfilled()
    }
  },
  fulfillObligation_payment(contract) { 
    if (contract.obligations.payment != null && (Predicates.happens(contract.paidServiceProvider)  && contract.requestedPayment.amount === contract.paidServiceProvider.amount) ) { 
      contract.obligations.payment.fulfilled()
    }
  },
  fulfillObligation_deliverProcessingRecord(contract) { 
    if (contract.obligations.deliverProcessingRecord != null && (Predicates.happens(contract.deliveredRecordOfProcessing)  && (contract.requestedRecordOfProcessing.dataId === contract.deliveredRecordOfProcessing.dataId)) ) { 
      contract.obligations.deliverProcessingRecord.fulfilled()
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
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.requestedDataProcessing), ], EventListeners.createObligation_processData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.infringementNotified), ], EventListeners.createObligation_adaptInstruction],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), ], EventListeners.createObligation_recordData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.requestedPayment), ], EventListeners.createObligation_payment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.requestedRecordOfProcessing), ], EventListeners.createObligation_deliverProcessingRecord],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.adaptInstruction), ], EventListeners.createPower_suspendService],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.adaptInstruction), ], EventListeners.createPower_suspendActiveRequest],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.adaptedInstruction), ], EventListeners.createPower_resumeService],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.suspensionNotified), ], EventListeners.activatePower_suspendService],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.suspensionNotified), ], EventListeners.activatePower_suspendActiveRequest],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData), new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.adaptedInstruction), ], EventListeners.fulfillObligation_processData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.clientAgreedTermination), new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.providerAgreedTermination), ], EventListeners.fulfillObligation_provideDataProcessingService],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.adaptedInstruction), ], EventListeners.fulfillObligation_adaptInstruction],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.recoProcessedData), ], EventListeners.fulfillObligation_recordData],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidServiceProvider), ], EventListeners.fulfillObligation_payment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.deliveredRecordOfProcessing), ], EventListeners.fulfillObligation_deliverProcessingRecord],
  ]
}

module.exports.EventListeners = EventListeners
module.exports.getEventMap = getEventMap
