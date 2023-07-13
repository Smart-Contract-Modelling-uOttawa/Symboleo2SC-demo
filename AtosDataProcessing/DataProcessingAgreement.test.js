'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../DataProcessingAgreement/index.js').contracts
const { serialize, deserialize } = require('../DataProcessingAgreement/serializer.js')
const { Instruction } = require('../DataProcessingAgreement/domain/assets/Instruction.js')
const {CategorySubjects} = require('../DataProcessingAgreement/domain/types/CategorySubjects')
const {ProcessingActitvity} = require('../DataProcessingAgreement/domain/types/ProcessingActitvity')
// const {DataType} = require('../DataProcessingAgreement/domain/types/')
const {Origin} = require('../DataProcessingAgreement/domain/types/Origin')
const {Region} = require('../DataProcessingAgreement/domain/types/Region')

let assert = sinon.assert
chai.use(sinonChai)

describe('DataProcessingAgreement chain code tests', () => {
  let transactionContext, chaincodeStub, parameters, parametersObject, 
    processedDataEvent, requestedDataProcessingEvent, requestedPaymentEvent,
    paidServiceProviderEvent, instruction;
  beforeEach(() => {
    transactionContext = new Context()

    chaincodeStub = sinon.createStubInstance(ChaincodeStub)
    transactionContext.setChaincodeStub(chaincodeStub)

    chaincodeStub.putState.callsFake((key, value) => {
      if (!chaincodeStub.states) {
        chaincodeStub.states = {}
      }
      chaincodeStub.states[key] = value
    })

    chaincodeStub.getState.callsFake(async (key) => {
      let ret
      if (chaincodeStub.states) {
        ret = chaincodeStub.states[key]
      }
      return Promise.resolve(ret)
    })

    chaincodeStub.deleteState.callsFake(async (key) => {
      if (chaincodeStub.states) {
        delete chaincodeStub.states[key]
      }
      return Promise.resolve(key)
    })

    chaincodeStub.getStateByRange.callsFake(async () => {
      function* internalGetStateByRange() {
        if (chaincodeStub.states) {
          // Shallow copy
          const copied = Object.assign({}, chaincodeStub.states)

          for (let key in copied) {
            yield { value: copied[key] }
          }
        }
      }

      return Promise.resolve(internalGetStateByRange())
    })
    instruction = new Instruction("Instruction1", Origin.Customer, Region.EU, CategorySubjects.Customers, ProcessingActitvity.Collection)
    parametersObject = {
      atos: { },
      client: { },
      instruction: new Instruction("Instruction1", Origin.Customer, Region.EU, CategorySubjects.Customers, ProcessingActitvity.Collection),
    }
    parameters = JSON.stringify(parametersObject)
    requestedDataProcessingEvent = {
      dataPoint: {
        id: "id",
        content: 'AAAAAAAAAAA'
      }
    }
    processedDataEvent = {
      dataId: "id",
      instruction: new Instruction("Instruction1", Origin.Customer, Region.EU, CategorySubjects.Customers, ProcessingActitvity.Collection)
    }
    requestedPaymentEvent = {
      amount: 100
    }
    paidServiceProviderEvent = {
      amount: 100
    }
  })

  describe('Test init transaction.', () => {
    it('should return error on init.', async () => {
      chaincodeStub.putState.rejects('failed inserting key')
      let c = new HFContract()
      try {
        await c.init(transactionContext, parameters)
        assert.fail('InitLedger should have failed')
      } catch (err) {
        expect(err.name).to.equal('failed inserting key')
      }
    })

    it('should activate contract with the correct state for powers and obligations.', async () => {
      const c = new HFContract();
      const initRes = await c.init(transactionContext, parameters);
      expect(initRes.successful).to.eql(true);
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
    })
  })

  // describe('Test transactions for triggering Events.', () => {
  //   it('should change state of suspendNoticed.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.suspendNoticed._triggered).to.eql(true)
  //   })
    
  //   it('should change state of adaptedInst.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_adaptedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.adaptedInst._triggered).to.eql(true)
  //   })
    
  //   it('should change state of infringNotified.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.infringNotified._triggered).to.eql(true)
  //   })

  //   it('should change state of modifiedInst.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_modifiedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.modifiedInst._triggered).to.eql(true)
  //   })

  //   it('should change state of recoProcessedData.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.recoProcessedData._triggered).to.eql(true)
  //   })
    
  //   it('should change state of paid.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.paid._triggered).to.eql(true)
  //   })

  //   it('should change state of deliveredRecord.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_deliveredRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.deliveredRecord._triggered).to.eql(true)
  //   })

  //   it('should change state of requestedRecord.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_requestedRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.requestedRecord._triggered).to.eql(true)
  //   })
  // })

  describe('Scenario 1: reqesuted services are provided, payment obligation is fulfilled, and conract is wilfully terminated.', () => {
    it('should trigger processData if requestedDataProcessing happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill processData if processedData happens and contracct should still be active.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Fulfillment")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should not fulfill processData if processedData instrucitons does not match.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          dataId: "id",
          instruction: new Instruction("Instruction1", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Collection)
        }}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger deliverProcessingRecord if requestedRecordOfProcessing happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_requestedRecordOfProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {dataId: 'id'}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedRecordOfProcessing._triggered).to.eql(true)
      expect(state.obligations.deliverProcessingRecord.state).to.eql("Active")
      expect(state.obligations.deliverProcessingRecord.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill deliverProcessingRecord if deliveredRecordOfProcessing happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_requestedRecordOfProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {dataId: 'id'}}))).successful).to.eql(true)
      expect((await c.trigger_deliveredRecordOfProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {dataId: 'id', instruction}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.deliveredRecordOfProcessing._triggered).to.eql(true)
      expect(state.obligations.deliverProcessingRecord.state).to.eql("Fulfillment")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger another instance of processData if requestedDataProcessing happens again.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state2.obligations.processData.state).to.eql("Active")
      expect(state2.obligations.processData.activeState).to.eql("InEffect")
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state3 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state3.obligations.processData.state).to.eql("Fulfillment")
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill processData again if processedData happens and contracct should still be active.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Fulfillment")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger payment if requestedPayment happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedPayment(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedPaymentEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedPayment._triggered).to.eql(true)
      expect(state.obligations.payment.state).to.eql("Active")
      expect(state.obligations.payment.activeState).to.eql("InEffect")
    })

    it('should fulfill payment if paidServiceProvider happens and contracct should still be active.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedPayment(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedPaymentEvent}))).successful).to.eql(true)
      expect((await c.trigger_paidServiceProvider(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paidServiceProviderEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.paidServiceProvider._triggered).to.eql(true)
      expect(state.obligations.payment.state).to.eql("Fulfillment")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should successfully terminate contract if clientAgreedTermination and providerAgreedTermination happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)      
      expect((await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)      
      expect((await c.trigger_requestedPayment(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedPaymentEvent}))).successful).to.eql(true)
      expect((await c.trigger_paidServiceProvider(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paidServiceProviderEvent}))).successful).to.eql(true)
      expect((await c.trigger_clientAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_providerAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.clientAgreedTermination._triggered).to.eql(true)
      expect(state.providerAgreedTermination._triggered).to.eql(true)
      expect(state.obligations.provideDataProcessingService.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    })
  })

  describe('Scenario 2: instruction infringment is found and is adapted by the client.', () => {
    it('should trigger processData if requestedDataProcessing happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger adaptInstruction if infringementNotified happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.infringementNotified._triggered).to.eql(true)
      expect(state.obligations.adaptInstruction.state).to.eql("Active")
      expect(state.obligations.adaptInstruction.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill adaptInstruction if adaptedInstruction happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.infringementNotified._triggered).to.eql(true)
      expect(state.adaptedInstruction._triggered).to.eql(true)
      expect(state.obligations.adaptInstruction.state).to.eql("Fulfillment")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill processData according to the new instruction if processedData happens and contracct should still be active.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {
          dataId: "id",
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true);
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Fulfillment")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should not fulfill processData if processedData is not compatible with the new instruction.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {
          dataId: "id",
          instruction: new Instruction("Instruction2", Origin.Customer, Region.EU, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true);
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should successfully terminate contract if clientAgreedTermination and providerAgreedTermination happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_clientAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_providerAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.clientAgreedTermination._triggered).to.eql(true)
      expect(state.providerAgreedTermination._triggered).to.eql(true)
      expect(state.obligations.provideDataProcessingService.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    })
  })

  describe('Scenario 3: adaptInstruction violated.', () => {
    it('should trigger processData if requestedDataProcessing happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedDataProcessing._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Active")
      expect(state.obligations.processData.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger adaptInstruction if infringementNotified happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.infringementNotified._triggered).to.eql(true)
      expect(state.obligations.adaptInstruction.state).to.eql("Active")
      expect(state.obligations.adaptInstruction.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger suspendService and suspendActiveRequest powers if adaptInstruction is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.adaptInstruction.state).to.eql("Violation")
      expect(state.powers.suspendService.state).to.eql("Create")
      expect(state.powers.suspendActiveRequest.state).to.eql("Create")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should activate suspendService and suspendActiveRequest powers if suspensionNotified happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.adaptInstruction.state).to.eql("Violation")
      expect(state.powers.suspendService.state).to.eql("Active")
      expect(state.powers.suspendService.activeState).to.eql("InEffect")
      expect(state.powers.suspendActiveRequest.state).to.eql("Active")
      expect(state.powers.suspendActiveRequest.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should terminate processData if suspendActiveRequest is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_suspendActiveRequest_terminated_o_processData(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.suspendService.state).to.eql("Active")
      expect(state.powers.suspendService.activeState).to.eql("InEffect")
      expect(state.obligations.processData.state).to.eql("UnsuccessfulTermination")
      expect(state.powers.suspendActiveRequest.state).to.eql("SuccessfulTermination")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should terminate provideDataProcessingService if suspendService is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_suspendActiveRequest_terminated_o_processData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_suspendService_suspended_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("Suspension")
      expect(state.obligations.processData.state).to.eql("UnsuccessfulTermination")
      expect(state.powers.suspendActiveRequest.state).to.eql("SuccessfulTermination")
      expect(state.powers.suspendService.state).to.eql("SuccessfulTermination")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should trigger resumeService if adaptedInstruction happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_suspendActiveRequest_terminated_o_processData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_suspendService_suspended_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.resumeService.state).to.eql("Active")
      expect(state.powers.resumeService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should resume provideDataProcessingService if resumeService is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_suspendActiveRequest_terminated_o_processData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_suspendService_suspended_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      expect((await c.p_resumeService_resumed_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.resumeService.state).to.eql("SuccessfulTermination")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should fulfill processData if processedData is compatible with the new instruction.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringementNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.violateObligation_adaptInstruction(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspensionNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_suspendActiveRequest_terminated_o_processData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_suspendService_suspended_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_adaptedInstruction(transactionContext, 
        JSON.stringify({ contractId: initRes.contractId, event: {
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true)
      expect((await c.p_resumeService_resumed_o_provideDataProcessingService(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_requestedDataProcessing(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: requestedDataProcessingEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {
          dataId: "id",
          instruction: new Instruction("Instruction2", Origin.Customer, Region.MEA, CategorySubjects.Customers, ProcessingActitvity.Recording)
        }}))).successful).to.eql(true);
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.processData.state).to.eql("Fulfillment")
      expect(state.obligations.provideDataProcessingService.state).to.eql("Active")
      expect(state.obligations.provideDataProcessingService.activeState).to.eql("InEffect")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")
    })

    it('should successfully terminate contract if clientAgreedTermination and providerAgreedTermination happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_clientAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_providerAgreedTermination(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.clientAgreedTermination._triggered).to.eql(true)
      expect(state.providerAgreedTermination._triggered).to.eql(true)
      expect(state.obligations.provideDataProcessingService.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    })
  })
})
