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
it('should correctly compute paidLate amount using % and pow operator on interestRate', async () => {
  // Set parameters to values that trigger % logic
  parametersObject.amt = 100
  parametersObject.interestRate = 102  // 102 % 100 = 2
  parametersObject.qnt = 2
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  // Simulate violation so that latePayment gets triggered
  await c.violateObligation_payment(transactionContext, initRes.contractId)
  await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
  await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  // Validate the computed amount
  const expectedPaidLateAmount = parametersObject.amt * Math.pow(1 + ((parametersObject.interestRate % 100) / 100), parametersObject.qnt)
  expect(state.paidLate.amount).to.be.approximately(expectedPaidLateAmount, 0.01)
})
it('should correctly compute paidLate amount using new operator on interestRate, 2nd test', async () => {
  // Test data where % operator will be clearly visible
  const amt = 100;
  const interestRate = 102;  // Interest rate (102 % 100 = 2)
  const qnt = 2;
  const expectedMultiplier = Math.pow(1 + ((interestRate % 100) / 100), qnt);

  // Initialize contract
  parametersObject.amt = amt;
  parametersObject.interestRate = interestRate;
  parametersObject.qnt = qnt;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);

  // Simulate violation and trigger late payment
  await c.violateObligation_payment(transactionContext, initRes.contractId);
  await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId);
  await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }));

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
  
  const expectedPaidLateAmount = amt * expectedMultiplier;
  expect(state.paidLate.amount).to.be.approximately(expectedPaidLateAmount, 0.01);
})

//For all the below math function test cases, this.paid.amount in events.js needs to be updated accordingly.

//this.paid.amount = Math.max(this.amt,50)
it('should compute paid amount using Math.max', async () => {
  parametersObject.amt = 40  // Less than 50
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  expect(state.paid.amount).to.equal(50)
})
it('should compute paid amount using Math.max when amt > 50', async () => {
  parametersObject.amt = 60
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  expect(state.paid.amount).to.equal(50)
})
it('should compute paid amount using Math.max when amt == 50', async () => {
  parametersObject.amt = 50
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  expect(state.paid.amount).to.equal(50)
})
//this.paid.amount = Math.min(this.amt,20)
it('should cap paid amount when amt is greater using Math.min', async () => {
  parametersObject.amt = 20; // Should be capped to 20
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(20);
})
it('should compute paid amount using Math.min when amt is less', async () => {
  parametersObject.amt = 10;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(10);
})
it('should compute paid amount using Math.min when amt == 20', async () => {
  parametersObject.amt = 20;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(20);
})
//this.paid.amount = Math.pow(amt, 2)
it('should compute paid amount using Math.pow when amt = 3', async () => {
  parametersObject.amt = 3;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(9);
})
it('should compute paid amount using Math.pow when amt = 2', async () => {
  parametersObject.amt = 2;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(4);
})
it('should compute paid amount using Math.pow when amt = 1', async () => {
  parametersObject.amt = 1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(1);
})
it('should fulfill delivery obligation only if weakHappensBefore is true and paidLate.amount < paid.amount + 100', async () => {
  parametersObject.amt = 100
  parametersObject.interestRate = 1
  parametersObject.qnt = 1
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  await c.violateObligation_payment(transactionContext, initRes.contractId)
  await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
  await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  await c.p_resumeDelivery_resumed_o_delivery(transactionContext, initRes.contractId)
  await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId }))

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  expect(state.obligations.delivery.state).to.eql("Fulfillment")
})
it('should not fulfill delivery obligation if paidLate.amount >= paid.amount + 100', async () => {
  // Set values so that paidLate.amount becomes large
  parametersObject.amt = 100
  parametersObject.interestRate = 150 // Very high interest → large paidLate.amount
  parametersObject.qnt = 2
  const parameters = JSON.stringify(parametersObject)

  const c = new HFContract()
  const initRes = await c.init(transactionContext, parameters)

  // Trigger the same events
  await c.violateObligation_payment(transactionContext, initRes.contractId)
  await c.p_suspendDelivery_suspended_o_delivery(transactionContext, initRes.contractId)
  await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: initRes.contractId }))
  await c.p_resumeDelivery_resumed_o_delivery(transactionContext, initRes.contractId)
  await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: initRes.contractId }))

  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString())

  // Expect delivery NOT to be fulfilled
  expect(state.obligations.delivery.state).to.not.eql("Fulfillment")
  expect(state.obligations.delivery.state).to.eql("Active")
})
//this.paid.amount = Math.abs(amt);
it('should compute paid amount using Math.abs when amt = -50', async () => {
  parametersObject.amt = -50;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(50);
})
it('should compute paid amount using Math.abs and amt is mismatched', async () => {
  parametersObject.amt = -20;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(50);
})
//this.paid.amount = Math.floor(amt);
it('should compute paid amount using Math.floor when amt = 10.7', async () => {
  parametersObject.amt = 10.7;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(10);
})
it('should compute paid amount using Math.floor when amt = 10.7', async () => {
  parametersObject.amt = 10.7;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(11);
})
//this.paid.amount = Math.ciel(amt);
it('should compute paid amount using Math.ceil when amt = 10.1', async () => {
  parametersObject.amt = 10.1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(11);
})
it('should compute paid amount using Math.ceil when amt = 10.0', async () => {
  parametersObject.amt = 10.0;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(10);
})
//this.paid.amount = Math.cbrt(amt), cube root of amt
it('should compute paid amount using Math.cbrt when amt = 27', async () => {
  parametersObject.amt = 27;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.be.closeTo(3, 0.001);
})
it('should compute paid amount using Math.cbrt when amt = -1', async () => {
  parametersObject.amt = -1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.be.equal(-1);
})
//this.paid.amount = Math.exp(amt), e raised to the power of a number.
it('should compute paid amount using Math.exp when amt = 1', async () => {
  parametersObject.amt = 1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.be.closeTo(Math.exp(1), 0.001);
})
it('should compute paid amount using Math.exp when amt = 0', async () => {
  parametersObject.amt = 0;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.be.equal(1);
})
it('should compute paid amount using Math.exp when amt = 1', async () => {
  parametersObject.amt = 1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.be.closeTo(2.7, 0.1);
})
//this.paid.amount = Math.sign(amt)
it('should compute paid amount using Math.sign when amt = -5', async () => {
  parametersObject.amt = -5;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(-1);
})
it('should compute paid amount using Math.sign when amt = 3', async () => {
  parametersObject.amt = 3;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(1);
})
it('should compute paid amount using Math.sign when amt = 0', async () => {
  parametersObject.amt = 0;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(0);
})
//this.paid.amount = Math.sqrt(amt)
it('should compute paid amount using Math.sqrt when amt = 16', async () => {
  parametersObject.amt = 16;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(4);
})
//this.paid.amount = Math.sqrt(amt)
it('should compute paid amount using Math.sqrt when amt = 1', async () => {
  parametersObject.amt = 1;
  const parameters = JSON.stringify(parametersObject);

  const c = new HFContract();
  const initRes = await c.init(transactionContext, parameters);
  const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());

  expect(state.paid.amount).to.equal(1);
})
})
})
