'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../TransactiveEnergyAgreement/index.js').contracts
const { serialize, deserialize } = require('../TransactiveEnergyAgreement/serializer')

let assert = sinon.assert
chai.use(sinonChai)

describe('TransactiveEnergyAgreement chain code tests', () => {
  let transactionContext, chaincodeStub, parameters, parametersObject
  let dStartTime = new Date()
    let dEndTime = new Date(dStartTime)
    dEndTime.setHours(dEndTime.getHours() + 3)
    let eStartTime = new Date(dStartTime)
    let eEndTime = new Date(dEndTime)
    // dEndTime.setHours(dEndTime.getHours() + 3)
    let bidEvent = {bid: {
      id: 'id',
      dispatchStartTime: dStartTime,
      dispatchEndTime: dEndTime,
      energy: 10,
      price: 10,
      instruction: {maxVoltage: 10, minVoltage: 2}
    }}
    let supplyEvent = {
      id: 'id',
      energy: 10, 
      dispatchStartTime: eStartTime, 
      dispatchEndTime: eEndTime, 
      voltage: 5, 
      ampere: 10
    }
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
      "caiso": { },
      "derp": { }
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
      expect(state.powers.terminateAgreementBySupplier.state).to.eql("Create")
    })
  })

  // describe('Test transactions for triggering Events.', () => {
  //   it('should change state of bidAccepted.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.bidAccepted._triggered).to.eql(true)
  //   })

  //   it('should change state of caisoTerminationNoticeIssued.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_caisoTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.caisoTerminationNoticeIssued._triggered).to.eql(true)
  //   })
    
  //   it('should change state of derpTerminationNoticeIssued.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_derpTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.derpTerminationNoticeIssued._triggered).to.eql(true)
  //   })
    
  //   it('should change state of creditInvoiceIssued.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_creditInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.creditInvoiceIssued._triggered).to.eql(true)
  //   })

  //   it('should change state of isoPaid.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_isoPaid(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.isoPaid._triggered).to.eql(true)
  //   })

  //   it('should change state of penaltyInvoiceIssued.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_penaltyInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.penaltyInvoiceIssued._triggered).to.eql(true)
  //   })
    
  //   it('should change state of paidPenalty.', async () => {
  //     const c = new HFContract()
  //     const initRes = await c.init(transactionContext, parameters)
  //     const res = await c.trigger_paidPenalty(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  //     expect(res.successful).to.eql(true)
  //     const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
  //     expect(state.paidPenalty._triggered).to.eql(true)
  //   })
  // })

  describe('Scenario: bidAccepted and paybyISO and supplyEnergy are fulfilled.', () => {
    it('should trigger supplyEnergy if bidAccepted happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: bidEvent}))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.bidAccepted._triggered).to.eql(true)
      expect(state.obligations.supplyEnergy.state).to.eql("Active")
      expect(state.obligations.supplyEnergy.activeState).to.eql("InEffect") 
    })

    it('should fulfill supplyEnergy and trigger paybyISO if energySupplied happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: bidEvent}))
      expect(res.successful).to.eql(true)
      const res2 = await c.trigger_energySupplied(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: supplyEvent}))
      expect(res2.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.energySupplied._triggered).to.eql(true)
      expect(state.obligations.supplyEnergy.state).to.eql("Fulfillment")
      expect(state.obligations.paybyISO.state).to.eql("Active")
      expect(state.obligations.paybyISO.activeState).to.eql("InEffect") 
    })

    it('should successfully terminate contract if paybyISO is fulfilled.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: bidEvent}))
      expect(res.successful).to.eql(true)
      const res2 = await c.trigger_energySupplied(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: supplyEvent}))
      expect(res2.successful).to.eql(true)
      const res3 = await c.trigger_creditInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res3.successful).to.eql(true)
      const res4 = await c.trigger_isoPaid(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res4.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.isoPaid._triggered).to.eql(true)
      expect(state.obligations.paybyISO.state).to.eql("Fulfillment")
      expect(state.state).to.eql("SuccessfulTermination")
    })    
  })

  describe('Scenario2: supplyEnergy is violated', () => {
    it('should activate imposePenalty if supplyEnergy is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res.successful).to.eql(true)
      const res2 = await c.violateObligation_supplyEnergy(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.supplyEnergy.state).to.eql("Violation")
      expect(state.powers.imposePenalty.state).to.eql("Active")
      expect(state.powers.imposePenalty.activeState).to.eql("InEffect") 
    })

    it('should trigger payPenalty if imposePenalty is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res.successful).to.eql(true)
      const res2 = await c.violateObligation_supplyEnergy(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const res3 = await c.p_imposePenalty_triggered_o_payPenalty(transactionContext, initRes.contractId)
      expect(res3.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.powers.imposePenalty.state).to.eql("SuccessfulTermination")
      expect(state.obligations.payPenalty.state).to.eql("Active")
      expect(state.obligations.payPenalty.activeState).to.eql("InEffect") 
    })

    it('should fulfill payPenalty and successfuly terminate contract if penaltyInvoiceIssued and paidPenalty happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.violateObligation_supplyEnergy(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_imposePenalty_triggered_o_payPenalty(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_penaltyInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.trigger_paidPenalty(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)

      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.payPenalty.state).to.eql("Fulfillment")
      expect(state.paidPenalty._triggered).to.eql(true)
      expect(state.penaltyInvoiceIssued._triggered).to.eql(true) 
      expect(state.state).to.eql("SuccessfulTermination") 
    })

    it('should trigger terminateAgreement if payPenalty is violated.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.violateObligation_supplyEnergy(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_imposePenalty_triggered_o_payPenalty(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_penaltyInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.violateObligation_payPenalty(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_caisoTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.obligations.payPenalty.state).to.eql("Violation")
      expect(state.powers.terminateAgreement.state).to.eql("Active")
      expect(state.powers.terminateAgreement.activeState).to.eql("InEffect") 
    })

    it('should terminate contract if terminateAgreement is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_bidAccepted(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.violateObligation_supplyEnergy(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.p_imposePenalty_triggered_o_payPenalty(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_penaltyInvoiceIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.violateObligation_payPenalty(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_caisoTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))).successful).to.eql(true)
      expect((await c.p_terminateAgreement_terminated_contract(transactionContext, initRes.contractId)).successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.state).to.eql("UnsuccessfulTermination")
      expect(state.powers.terminateAgreement.state).to.eql("SuccessfulTermination")
    })
  })

  describe('Scenario3: terminate by derpTerminationNoticeIssued.', () => {
    it('should activate terminateAgreementBySupplier if derpTerminationNoticeIssued happens.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_derpTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.derpTerminationNoticeIssued._triggered).to.eql(true)
      expect(state.powers.terminateAgreementBySupplier.state).to.eql("Active")
      expect(state.powers.terminateAgreementBySupplier.activeState).to.eql("InEffect") 
    })

    it('should terminate contract if terminateAgreementBySupplier is exerted.', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      const res = await c.trigger_derpTerminationNoticeIssued(transactionContext, JSON.stringify({ contractId: initRes.contractId}))
      expect(res.successful).to.eql(true)
      const res2 = await c.p_terminateAgreementBySupplier_terminated_contract(transactionContext, initRes.contractId)
      expect(res2.successful).to.eql(true)
      const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
      expect(state.derpTerminationNoticeIssued._triggered).to.eql(true)
      expect(state.powers.terminateAgreementBySupplier.state).to.eql("SuccessfulTermination")
      expect(state.state).to.eql("UnsuccessfulTermination") 
    })
  })
})
