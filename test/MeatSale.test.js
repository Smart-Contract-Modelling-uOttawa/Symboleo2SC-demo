'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../MeatSale/index').contracts
const { serialize, deserialize } = require('../MeatSale/serializer')

let assert = sinon.assert
chai.use(sinonChai)

describe('Meat Sale chain code tests', () => {
  let transactionContext, chaincodeStub, parameters, parametersObject
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
      "buyer": { "warehouse": "warehouse add" },
      "seller": { "returnAddress": "add", "name": "seller name" },
      "qnt": 2,
      "qlt": 3,
      "amt": 3,
      "curr": 1,
      "payDueDate": "2022-10-28T17:49:41.422Z",
      "delAdd": "delAdd",
      "effDate": "2022-10-28T17:49:41.422Z",
      "delDueDateDays": 3,
      "interestRate": 2
    }
    parameters = JSON.stringify(parametersObject)
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
      expect(state.obligations.payment.state).to.eql("Active")
      expect(state.obligations.payment.activeState).to.eql("InEffect")
      expect(state.obligations.delivery.state).to.eql("Active")
      expect(state.obligations.delivery.activeState).to.eql("InEffect")
    })
  })

  describe('Scenario: payment and delivery are fulfilled.', () => {
    it('should sucessfully terminate contract if payment and delivery are fulfilled.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res.successful).to.eql(true)
      const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res2.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("SuccessfulTermination")
      expect(state.obligations.delivery.state).to.eql("Fulfillment")
      expect(state.obligations.payment.state).to.eql("Fulfillment")
    })    
  })

  describe('Scenario: payment is violated.', () => {
    it('should violate payment.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.payment.state).to.eql("Violation")
    })

    it('should trigger latePayment and suspendDelivery if payment is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.payment.state).to.eql("Violation")
      expect(state.obligations.latePayment.state).to.eql("Active")
      expect(state.obligations.latePayment.activeState).to.eql("InEffect")
      expect(state.powers.suspendDelivery.state).to.eql("Active")
      expect(state.powers.suspendDelivery.activeState).to.eql("InEffect")
    })

    it('should suspend delivery if suspendDelivery is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.payment.state).to.eql("Violation")
      expect(state.obligations.latePayment.state).to.eql("Active")
      expect(state.obligations.latePayment.activeState).to.eql("InEffect")
      expect(state.powers.suspendDelivery.state).to.eql("Active")

      const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state2.obligations.delivery.state).to.eql("Active")
      expect(state2.obligations.delivery.activeState).to.eql("Suspension")
      expect(state2.powers.suspendDelivery.state).to.eql("SuccessfulTermination")
    })

    it('should trigger resumeDelivery and fulfill latePayment if paidLate is triggered.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res3.successful).to.eql(true)

      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.resumeDelivery.state).to.eql("Active")
      expect(state.powers.resumeDelivery.activeState).to.eql("InEffect")
      expect(state.obligations.latePayment.state).to.eql("Fulfillment")
    })

    it('should resume delivery if resumeDelivery is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res3.successful).to.eql(true)
      const res4 = await c.p_resumeDelivery_resumed_o_delivery(transactionContext, initRes.contractId)
      expect(res4.successful).to.eql(true)

      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.resumeDelivery.state).to.eql("SuccessfulTermination")
      expect(state.obligations.delivery.state).to.eql("Active")
      expect(state.obligations.delivery.activeState).to.eql("InEffect")
    })

    it('should successfully terminate contract if delivered is triggered.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res3.successful).to.eql(true)
      const res4 = await c.p_resumeDelivery_resumed_o_delivery(transactionContext, initRes.contractId)
      expect(res4.successful).to.eql(true)
      const res5 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
      expect(res5.successful).to.eql(true)

      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("SuccessfulTermination")
      expect(state.obligations.delivery.state).to.eql("Fulfillment")
      expect(state.obligations.latePayment.state).to.eql("Fulfillment")
    })

    it('should unsuccessfully terminate contract if latePayment is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_payment(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const res3 = await c.violateObligation_latePayment(transactionContext, initRes.contractId)
      expect(res3.successful).to.eql(true)

      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("UnsuccessfulTermination")
      expect(state.obligations.delivery.state).to.eql("UnsuccessfulTermination")
    })
    
  })

  describe('Scenario: delivery is violated.', () => {
    it('should violate delivery.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_delivery(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.delivery.state).to.eql("Violation")
    })

    it('should trigger terminateContract if delivery is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_delivery(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.delivery.state).to.eql("Violation")
      expect(state.powers.terminateContract.state).to.eql("Active")
      expect(state.powers.terminateContract.activeState).to.eql("InEffect")
    })

    it('should terminateContract if terminateContract is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.violateObligation_delivery(transactionContext, initRes.contractId)
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.delivery.state).to.eql("Violation")
      expect(state.powers.terminateContract.state).to.eql("Active")
      expect(state.powers.terminateContract.activeState).to.eql("InEffect")

      const res2 = await c.p_terminateContract_terminated_contract(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state2.state).to.eql("UnsuccessfulTermination")
      expect(state2.obligations.payment.state).to.eql("UnsuccessfulTermination")
      expect(state2.powers.terminateContract.state).to.eql("SuccessfulTermination")
    })    
  })
})
