'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../AtosDataProcessing/index.js').contracts
const { serialize, deserialize } = require('../AtosDataProcessing/serializer.js')
const { Instruction } = require('../AtosDataProcessing/domain/assets/Instruction.js')
const {CatSubjects} = require('../AtosDataProcessing/domain/types/CatSubjects')
const {CateProcessingAct} = require('../AtosDataProcessing/domain/types/CateProcessingAct')
const {DataType} = require('../AtosDataProcessing/domain/types/DataType')
const {OriginDataType} = require('../AtosDataProcessing/domain/types/OriginDataType')
const {RegionData} = require('../AtosDataProcessing/domain/types/RegionData')

let assert = sinon.assert
chai.use(sinonChai)

describe('AtosDataProcessing chain code tests', () => {
  let transactionContext, chaincodeStub, parameters, parametersObject, processedDataEvent
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

    parametersObject = {
      atos: { },
      client: { },
      inst: new Instruction("", OriginDataType.Customer, RegionData.EU, CatSubjects.Customers, CateProcessingAct.Collection),
      dType: DataType.Personal,
      dataPointId: "id"
    }
    parameters = JSON.stringify(parametersObject)
    processedDataEvent = {
      id: "id",
      instruction: new Instruction("", OriginDataType.Customer, RegionData.EU, CatSubjects.Customers, CateProcessingAct.Collection)
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
      expect(state.obligations.oproccData.state).to.eql("Active")
      expect(state.obligations.oproccData.activeState).to.eql("InEffect")
    })
  })

  describe('Test transactions for triggering Events.', () => {
    it('should change state of suspendNoticed.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.suspendNoticed._triggered).to.eql(true)
    })
    
    it('should change state of adaptedInst.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_adaptedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.adaptedInst._triggered).to.eql(true)
    })
    
    it('should change state of infringNotified.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.infringNotified._triggered).to.eql(true)
    })

    it('should change state of modifiedInst.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_modifiedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.modifiedInst._triggered).to.eql(true)
    })

    it('should change state of recoProcessedData.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.recoProcessedData._triggered).to.eql(true)
    })
    
    it('should change state of paid.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.paid._triggered).to.eql(true)
    })

    it('should change state of deliveredRecord.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_deliveredRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.deliveredRecord._triggered).to.eql(true)
    })

    it('should change state of requestedRecord.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_requestedRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedRecord._triggered).to.eql(true)
    })
  })

  describe('Scenario: fulfilling all obligations.', () => {
    it('should trigger orecordData and opaid and fulfill oproccDataInst if processedData happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.processedData._triggered).to.eql(true)
      expect(state.obligations.oproccDataInst.state).to.eql("Fulfillment")
      expect(state.obligations.orecordData.state).to.eql("Active")
      expect(state.obligations.orecordData.activeState).to.eql("InEffect") 
      expect(state.obligations.opaid.state).to.eql("Active")
      expect(state.obligations.opaid.activeState).to.eql("InEffect") 
    })

    it('should successfully terminate contract if paid and recoProcessedData happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.recoProcessedData._triggered).to.eql(true)
      expect(state.paid._triggered).to.eql(true)
      expect(state.obligations.orecordData.state).to.eql("Fulfillment")
      expect(state.obligations.opaid.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    })

    it('should successfully terminate contract if infringNotified and adaptedInst happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_adaptedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.recoProcessedData._triggered).to.eql(true)
      expect(state.paid._triggered).to.eql(true)
      expect(state.obligations.orecordData.state).to.eql("Fulfillment")
      expect(state.obligations.opaid.state).to.eql("Fulfillment")
      expect(state.obligations.oadaptInst.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    }) 
  })

  describe('Scenario: oadaptInst is violated.', () => {
    it('should trigger psuspendPerformance if oadaptInst is violated and suspendNoticed happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.violateObligation_oadaptInst(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.psuspendPerformance.state).to.eql("Create")
      expect((await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state2.powers.psuspendPerformance.state).to.eql("Active")
      expect(state2.powers.psuspendPerformance.activeState).to.eql("InEffect")
    })

    it('should suspend oproccData if psuspendPerformance is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.violateObligation_oadaptInst(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_psuspendPerformance_suspended_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.psuspendPerformance.state).to.eql("SuccessfulTermination")
      expect(state.obligations.oproccData.state).to.eql("Active")
      expect(state.obligations.oproccData.activeState).to.eql("Suspension")
    })

    it('should trigger presumPerformance if modifiedInst is triggered.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.violateObligation_oadaptInst(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_psuspendPerformance_suspended_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_modifiedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.presumPerformance.state).to.eql("Active")
      expect(state.powers.presumPerformance.activeState).to.eql("InEffect")
    })

    it('should resume oproccData if presumPerformance is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.violateObligation_oadaptInst(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_psuspendPerformance_suspended_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_modifiedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_presumPerformance_resumed_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.presumPerformance.state).to.eql("SuccessfulTermination")
      expect(state.obligations.oproccData.state).to.eql("Active")
      expect(state.obligations.oproccData.activeState).to.eql("InEffect")
    })

    it('should terminate contract if all obligations are fulfilled.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_infringNotified(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.violateObligation_oadaptInst(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_suspendNoticed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_psuspendPerformance_suspended_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_modifiedInst(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.p_presumPerformance_resumed_o_oproccData(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("SuccessfulTermination")
    })
  })

  describe('Scenario: odelRecord is triggered.', () => {
    it('should trigger odelRecord if requestedRecord is triggered.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.requestedRecord._triggered).to.eql(true)
      expect(state.obligations.odelRecord.state).to.eql("Active")
      expect(state.obligations.odelRecord.activeState).to.eql("InEffect")
    })

    it('should fulfill odelRecord if deliveredRecord is triggered.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_deliveredRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.deliveredRecord._triggered).to.eql(true)
      expect(state.obligations.odelRecord.state).to.eql("Fulfillment")
    })

    it('should terminate contract if all obligations are fulfilled.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requestedRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_deliveredRecord(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_processedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_recoProcessedData(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: processedDataEvent}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.deliveredRecord._triggered).to.eql(true)
      expect(state.state).to.eql("SuccessfulTermination")
    })
  })
})
