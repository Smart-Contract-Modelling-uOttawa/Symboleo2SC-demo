'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../VaccineProcurementC/index.js').contracts
const { serialize, deserialize } = require('../VaccineProcurementC/serializer')

let assert = sinon.assert
chai.use(sinonChai)

describe('VaccineProcurementC chain code tests', () => {
  let transactionContext, chaincodeStub, parameters, parametersObject
  let reqEvent={reqID : "1", dosage: 200, date: "2023-03-19T15:49:41.422Z"}
  let leD={reqID: "1", date: "2023-03-20T15:49:41.422Z"}
  let notifiD={reqID: "1", delD: "2023-03-20T17:49:41.422Z"}
  let confrM={reqID : "1", shipToLocation: 2}
  let delivrD={reqID : "1", dosage : 200, delAddr : 2,  date: "2023-03-20T17:49:41.422Z", temperature: -88}
  let agreD={reqID: "1"}
  let paiD={reqID : "1",  amount:3900}
  //////////////////////Second Request
 let reqEvent2={reqID : "2", dosage: 300, date: "2023-03-19T15:49:41.422Z"}
 let leD2={reqID: "2", date: "2023-03-21T15:49:41.422Z"}
  let notifiD2={reqID: "2", delD: "2023-03-21T17:49:41.422Z"}
  let confrM2={reqID : "2", shipToLocation: 2}
  let delivrD2={reqID : "2", dosage : 300, delAddr : 2,  date: "2023-03-21T17:49:41.422Z", temperature: -88}
  let agreD2={reqID: "2"}
  let invoicedD={reqID : "1",noOfDoses : 200, date : "2023-04-28T15:49:41.422Z"}
  let invoicedD2={reqID : "2",noOfDoses : 300, date : "2023-04-27T15:49:41.422Z"}
  let paiD2={reqID : "2",  amount:5850}
  
  ////////////////////////////////req3
  let reqEvent3={reqID : "3", dosage: 500, date: "2023-03-19T15:49:41.422Z"}
 let leD3={reqID: "3", date: "2023-03-21T15:49:41.422Z"}
  let notifiD3={reqID: "3", delD: "2023-03-21T17:49:41.422Z"}
  let confrM3={reqID : "3", shipToLocation: 2}
  let delivrD3={reqID : "3", dosage : 500, delAddr : 2,  date: "2023-03-21T17:49:41.422Z", temperature: -88}
  let agreD3={reqID: "3"}
  let invoicedD3={reqID : "3",noOfDoses : 500, date : "2023-04-28T15:49:41.422Z"}
  let paiD3={reqID : "3",  amount:9750}
  ////////////////////////////////////////////
  let reqEvent4={reqID : "4", dosage: 150, date: "2023-03-19T15:49:41.422Z"}
 let leD4={reqID: "4", date: "2023-03-21T15:49:41.422Z"}
  let notifiD4={reqID: "4", delD: "2023-03-21T17:49:41.422Z"}
  let confrM4={reqID : "4", shipToLocation: 2}
  let delivrD4={reqID : "4", dosage : 150, delAddr : 2,  date: "2023-04-21T17:49:41.422Z", temperature: -88}
  let agreD4={reqID: "4"}
  let invoicedD4={reqID : "4",noOfDoses : 150, date : "2023-03-22T15:49:41.422Z"}
  let paiD4={reqID : "4",  amount:2925}
  let riskD4={reqID : "4", extendedDel: "2023-04-21T17:49:41.422Z" }
  /////////////////////////////////////////////
  let reqEvent5={reqID : "5", dosage: 500, date: "2023-03-19T15:49:41.422Z"}
 let leD5={reqID: "5", date: "2023-03-21T15:49:41.422Z"}
  let notifiD5={reqID: "5", delD: "2023-03-21T17:49:41.422Z"}
  let confrM5={reqID : "5", shipToLocation: 2}
  let delivrD5={reqID : "5", dosage : 500, delAddr : 2,  date: "2023-03-21T17:49:41.422Z", temperature: -88}
  let agreD5={reqID: "5"}
  let invoicedD5={reqID : "5",noOfDoses : 500, date : "2023-03-28T15:49:41.422Z"}
  let paiD5={reqID : "5",  amount:9000}
  let paiD55={reqID : "5",  amount:9750}
  //let invoiceD1={}
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
      "pfizer":  {},
      "mcdc":  {},
      "approval": true,
      "unitPrice": 19.50,
       "minQuantity": 100,
       "maxQuantity" : 500,
       "temperature":-80
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
         })
  })

  describe('request and delivering 200 M doses as required. The contract still active for more dosage )', () => {
    it('all events happen in the required order and all the obligation except one are fulfilment', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      // const res = await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId , ID: "1", dosage: 200, date: "2023-03-19T13:49:41.422Z"}))
       // expect(res.successful).to.eql(true)  
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.obligations.oDeliver.state).to.eql("Fulfillment")
       expect(state2.obligations.oAssign.state).to.eql("Fulfillment")
       expect(state2.state).to.eql("Active")
       expect(state2.activeState).to.eql("InEffect")
    })    
  })
  describe('Two requests with without payment. The contract should terminate successfully', () => {
    it('The first request with 200 M doses and the second with 300 M doses. The contract should terminate successfully while surviving obligation is still not fulfilled. Then, the second request is invoiced and paid. The surviving obligation pay should be fulfilled. ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
       expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD}))).successful).to.eql(true)

       ///Second request
    
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent2}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD2}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD2}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD2}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM2}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD2}))).successful).to.eql(true)

      expect((await c.trigger_mcdcTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_pfizerTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       //Please change the invoiced date to be less that the current date because current date is the paid time
       expect(state2.obligations.oDeliver.state).to.eql("Fulfillment")
       expect(state2.obligations.oAssign.state).to.eql("Fulfillment")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("Fulfillment")
      expect(state2.state).to.eql("SuccessfulTermination")
      expect(state2.survivingObligations.oPay.state).to.eql("Create")
            expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD2}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD2}))).successful).to.eql(true)
      const state3 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       
      expect(state3.survivingObligations.oPay.state).to.eql("Fulfillment")
      
      
    }) 
  })

  describe('Two requests with more than 500 M doses. The request obligation is violated and the contract should be termenated Unsuccessfully', () => {
    it('Two requests with more than 500 M doses (300 M and 400 M) ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
       ///Second request
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent3}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD2}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD2}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD2}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM2}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD2}))).successful).to.eql(true)
       expect((await c.violateObligation_oAgreedOnRequest(transactionContext, initRes.contractId)).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Violation")
       expect(state2.obligations.oDeliver.state).to.eql("Create")
       expect(state2.obligations.oAssign.state).to.eql("Create")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination") 
      
    }) 
  })

  describe('Request with missing events', () => {
    it('pfizer delivered without notifying the goverment about delivery date. Delivery obligation should be violated and the contract terminated Unsuccessfully.  ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
      expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
      expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
     // expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
      expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
      expect((await c.violateObligation_oDeliver(transactionContext, initRes.contractId)).successful).to.eql(true)
       
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       expect(state2.obligations.oDeliver.state).to.eql("Violation")
       expect(state2.obligations.oAssign.state).to.eql("UnsuccessfulTermination")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination")
      
    }) 
  }) 
  describe('Request with missing events: The request obligation should be violated and the contract terminate unsuccessfully', () => {
    it('The manufacturer has sent a notification about the delivery time without government agreement about the lead time. ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
      expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
      expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
      expect((await c.violateObligation_oAgreedOnRequest(transactionContext, initRes.contractId)).successful).to.eql(true)

       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Violation")
       expect(state2.obligations.oDeliver.state).to.eql("UnsuccessfulTermination")
       expect(state2.obligations.oAssign.state).to.eql("UnsuccessfulTermination")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination")
      
    }) 
  })
  describe('Request with wrong order of events', () => {
    it('The invoiced was triggered before delivering. Payment obligation should be violated and the contract treminates unsuccessfully ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
      expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
      expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
      //setTimeout(() => {  console.log(""); }, 8000)
      expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
      expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
      expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD}))).successful).to.eql(true)
      //expect((await c.delay(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
      expect((await c.violateSurvivingObligations_oPay(transactionContext, initRes.contractId)).successful).to.eql(true)
      //expect((await c.violateObligation_oDeliver(transactionContext, initRes.contractId)).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.survivingObligations.oPay.state).to.eql("Violation")
       expect(state2.obligations.oDeliver.state).to.eql("Fulfillment")
       expect(state2.obligations.oAssign.state).to.eql("Fulfillment")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination")
      
    }) 
  })
 describe('Contract termination', () => {
    it('Except as required by applicable law or regulation or judicial or administrative order, the Government shall not have the authority to issue a Stop-Work Order to halt the work contemplated under this Statement of Work.  ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
      expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
      expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
      expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
      expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
      expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
    //  expect((await c.violateObligation_oAgreedOnRequest(transactionContext, initRes.contractId)).successful).to.eql(true)
      expect((await c.trigger_lawStopWork(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.trigger_govStopWork(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
     // expect((await c.trigger_govStopWork(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      expect((await c.p_pStopWork_terminated_contract(transactionContext, initRes.contractId)).successful).to.eql(true)
      
      const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.powers.pStopWork.state).to.eql("SuccessfulTermination")
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       expect(state2.obligations.oDeliver.state).to.eql("Fulfillment")
       expect(state2.obligations.oAssign.state).to.eql("Fulfillment")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination")
      
    }) 
  })
  describe('Surviving Obligation fulfilled after the contract termineated successfuly', () => {
    it('Request with 500M. After delivering the dosage, the contract should terminate successfully while surviving obligation still in created state. Then, invoiced and paid events are happenned . The Opay surviving obligation should be activated and fulfilled', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent3}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD3}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD3}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD3}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM3}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD3}))).successful).to.eql(true)
       expect((await c.trigger_mcdcTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_pfizerTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       
       expect(state2.survivingObligations.oPay.state).to.eql("Create")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("Fulfillment")
       expect(state2.state).to.eql("SuccessfulTermination")

       expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD3}))).successful).to.eql(true)
       expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD3}))).successful).to.eql(true)
       
       const state3 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       
       expect(state3.survivingObligations.oPay.state).to.eql("Fulfillment")
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state3.obligations.oRequestVaccineDosage.state).to.eql("Fulfillment")
      expect(state3.state).to.eql("SuccessfulTermination")
    }) 
  })
  describe(' Surviving Obligation violated after the contract termineated successfuly', () => {
    it('Request with 500 M doses. After delivering the dosage, the contract should terminate successfully while surviving obligation still in created state. Then, invoiced and paid events are happenned. Paid less than the required amount  while the contract was terminated  successfully. The Opay surviving obligation should be activated and violated', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent5}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD5}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD5}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD5}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM5}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD5}))).successful).to.eql(true)
       expect((await c.trigger_mcdcTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_pfizerTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       
       expect(state2.survivingObligations.oPay.state).to.eql("Create")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("Fulfillment")
       expect(state2.state).to.eql("SuccessfulTermination")
       // paid less than the required amount
       expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD5}))).successful).to.eql(true)
       expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD5}))).successful).to.eql(true)
       expect((await c.violateSurvivingObligations_oPay(transactionContext, initRes.contractId)).successful).to.eql(true)
       const state3 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       
       expect(state3.survivingObligations.oPay.state).to.eql("Violation")
       
    }) 
  })
  describe('Request with violated delivery obligation. Delivring after the notified delivery date.', () => {
    it('First the delivery should be violated and the stat of the contract should be UnsuccessfulTermination ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       ///Second request requested
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent4}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD4}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD4}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD4}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM4}))).successful).to.eql(true) 
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD4}))).successful).to.eql(true)
       expect((await c.violateObligation_oDeliver(transactionContext, initRes.contractId)).successful).to.eql(true)


       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.obligations.oDeliver.state).to.eql("Violation")
       expect(state2.obligations.oAssign.state).to.eql("UnsuccessfulTermination")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("UnsuccessfulTermination")
      expect(state2.state).to.eql("UnsuccessfulTermination")
      
    }) 

    it('The Out-of-control risk  is triggered with a new delivery date. The delivery obligation is fulfilled and the contract should be in Active state ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
       ///Second request requested
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent4}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD4}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD4}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD4}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM4}))).successful).to.eql(true) 
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD4}))).successful).to.eql(true)
       expect((await c.trigger_outsideRisk(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: riskD4}))).successful).to.eql(true)
       expect((await c.violateObligation_oDeliver(transactionContext, initRes.contractId)).successful).to.eql(false)


       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       expect(state2.obligations.oAgreedOnRequest.state).to.eql("Fulfillment")
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.obligations.oDeliver.state).to.eql("Fulfillment")
       expect(state2.obligations.oAssign.state).to.eql("Fulfillment")
       expect(state2.obligations.oRequestVaccineDosage.state).to.eql("Active")
      expect(state2.state).to.eql("Active")
      
    }) 
  })
  describe('before paying the due amount during contract activation time. The contract still active for more dosage )', () => {
    it('The surviving obligation oPay should not be activated ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      // const res = await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId , ID: "1", dosage: 200, date: "2023-03-19T13:49:41.422Z"}))
       // expect(res.successful).to.eql(true)  
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
       //expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
       expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD}))).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.survivingObligations.oPay.state).to.eql("Create")
       expect(state2.state).to.eql("Active")
    })  
    it('FDA  withdrew the approval before delivering the doses. The delivery obligation should be violated and the contract should terminate unsuccessfully ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      // const res = await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId , ID: "1", dosage: 200, date: "2023-03-19T13:49:41.422Z"}))
       // expect(res.successful).to.eql(true)  
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM}))).successful).to.eql(true)
       expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD}))).successful).to.eql(true)
       expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
      // expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD}))).successful).to.eql(true)
      //expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD}))).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.survivingObligations.oPay.state).to.eql("Create")
       expect(state2.state).to.eql("Active")
    })   
    it('After terminating the contract successfully, the FDA withdrew the vaccine approval. The withdrawApproval obligation is fulfillment and changed the approval, which consequently keeps the surviving obligation oPay in Create State ', async () => {
      const c = new HFContract()
      const initRes = await c.init(transactionContext, parameters)
      // const res = await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId , ID: "1", dosage: 200, date: "2023-03-19T13:49:41.422Z"}))
       // expect(res.successful).to.eql(true)  
       expect((await c.trigger_requested(transactionContext, JSON.stringify({ contractId: initRes.contractId, event : reqEvent5}))).successful).to.eql(true)
       expect((await c.trigger_leadtimeINform(transactionContext, JSON.stringify({ contractId: initRes.contractId , event: leD5}))).successful).to.eql(true)
       expect((await c.trigger_agreedFromG(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: agreD5}))).successful).to.eql(true)
       expect((await c.trigger_notifiedOD(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: notifiD5}))).successful).to.eql(true)
       expect((await c.trigger_confirmed(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: confrM5}))).successful).to.eql(true)
       //expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: delivrD5}))).successful).to.eql(true)
       expect((await c.trigger_mcdcTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_pfizerTerminateAgreement(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_withdrewApproval(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: {}}))).successful).to.eql(true)
       expect((await c.trigger_invoiced(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: invoicedD5}))).successful).to.eql(true)
      expect((await c.trigger_paid(transactionContext, JSON.stringify({ contractId: initRes.contractId, event: paiD55}))).successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())
       //expect(state2.obligations.oAgreedOnRequest.activeState).to.eql("InEffect")
       expect(state2.survivingObligations.oWithdrewApproval.state).to.eql("Fulfillment")
       expect(state2.survivingObligations.oPay.state).to.eql("Create")
       expect(state2.state).to.eql("SuccessfulTermination")
    }) 
  })
})  
  
