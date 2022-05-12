'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const {Obligation} = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../index.js').contracts
const {serialize, deserialize} = require('../serializer')

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

  describe('Test init', () => {
    it('should return error on init', async () => {
      chaincodeStub.putState.rejects('failed inserting key')
      let c = new HFContract()
      try {
        await c.init(transactionContext, parameters)
        assert.fail('InitLedger should have failed')
      } catch (err) {
        expect(err.name).to.equal('failed inserting key')
      }
    })

    it('should return success on init', async () => {
      const c = new HFContract()
      const res = await c.init(transactionContext, parameters)
      // console.log(res)
      // let ret = JSON.parse((await chaincodeStub.getState('asset1')).toString());
      expect(res.successful).to.eql(true)
    })
  })

  describe('Test trigger_paid', () => {
      it('should change state of paid', async () => {
          const c = new HFContract();
          const initRes = await c.init(transactionContext, parameters)
          const res = await c.trigger_paid(transactionContext, JSON.stringify({contractId: initRes.contractId}));
          expect(res.successful).to.eql(true);
          const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
          expect(state.paid._triggered).to.eql(true);
      });
  });

  describe('Test trigger_delivered', () => {
    it('should change state of delivered', async () => {
        const c = new HFContract();
        const initRes = await c.init(transactionContext, parameters)
        const res = await c.trigger_delivered(transactionContext, JSON.stringify({contractId: initRes.contractId}));
        expect(res.successful).to.eql(true);
        const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
        expect(state.delivered._triggered).to.eql(true);
    });
  });

  describe('Test trigger_paidLate', () => {
    it('should change state of paidLate', async () => {
        const c = new HFContract();
        const initRes = await c.init(transactionContext, parameters)
        const res = await c.trigger_paidLate(transactionContext, JSON.stringify({contractId: initRes.contractId}));
        expect(res.successful).to.eql(true);
        const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
        expect(state.paidLate._triggered).to.eql(true);
    });
  });
 
  describe('Test violateObligation_payment', () => {
    it('should violate payment', async () => {
        const c = new HFContract();
        const initRes = await c.init(transactionContext, parameters)
        const res = await c.violateObligation_payment(transactionContext, initRes.contractId);
        expect(res.successful).to.eql(true);
        const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
        expect(state.obligations.payment.state).to.eql("Violation");
    });
  });

  describe('Test violateObligation_latePayment', () => {
    it('should violate latePayment', async () => {
        const c = new HFContract();
        const initRes = await c.init(transactionContext, parameters)      
        const state = (await chaincodeStub.getState(initRes.contractId)).toString();
        const contract = deserialize(state)
        contract.obligations.latePayment = new Obligation('latePayment', contract.seller, contract.buyer, contract)
        contract.obligations.latePayment.trigerredUnconditional()
        await chaincodeStub.putState(initRes.contractId, Buffer.from(serialize(contract)))
        const res = await c.violateObligation_latePayment(transactionContext, initRes.contractId);
        expect(res.successful).to.eql(true);
        const state2 = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
        expect(state2.obligations.latePayment.state).to.eql("Violation");
    });
  });

  describe('Test violateObligation_delivery', () => {
    it('should violate delivery', async () => {
        const c = new HFContract();
        const initRes = await c.init(transactionContext, parameters)
        const res = await c.violateObligation_delivery(transactionContext, initRes.contractId);
        expect(res.successful).to.eql(true);
        const state = JSON.parse((await chaincodeStub.getState(initRes.contractId)).toString());
        expect(state.obligations.delivery.state).to.eql("Violation");
    });
  });

  // describe('Test ReadAsset', () => {
  //     it('should return error on ReadAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         try {
  //             await assetTransfer.ReadAsset(transactionContext, 'asset2');
  //             assert.fail('ReadAsset should have failed');
  //         } catch (err) {
  //             expect(err.message).to.equal('The asset asset2 does not exist');
  //         }
  //     });

  //     it('should return success on ReadAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         let ret = JSON.parse(await chaincodeStub.getState(asset.ID));
  //         expect(ret).to.eql(asset);
  //     });
  // });

  // describe('Test UpdateAsset', () => {
  //     it('should return error on UpdateAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         try {
  //             await assetTransfer.UpdateAsset(transactionContext, 'asset2', 'orange', 10, 'Me', 500);
  //             assert.fail('UpdateAsset should have failed');
  //         } catch (err) {
  //             expect(err.message).to.equal('The asset asset2 does not exist');
  //         }
  //     });

  //     it('should return success on UpdateAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         await assetTransfer.UpdateAsset(transactionContext, 'asset1', 'orange', 10, 'Me', 500);
  //         let ret = JSON.parse(await chaincodeStub.getState(asset.ID));
  //         let expected = {
  //             ID: 'asset1',
  //             Color: 'orange',
  //             Size: 10,
  //             Owner: 'Me',
  //             AppraisedValue: 500
  //         };
  //         expect(ret).to.eql(expected);
  //     });
  // });

  // describe('Test DeleteAsset', () => {
  //     it('should return error on DeleteAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         try {
  //             await assetTransfer.DeleteAsset(transactionContext, 'asset2');
  //             assert.fail('DeleteAsset should have failed');
  //         } catch (err) {
  //             expect(err.message).to.equal('The asset asset2 does not exist');
  //         }
  //     });

  //     it('should return success on DeleteAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         await assetTransfer.DeleteAsset(transactionContext, asset.ID);
  //         let ret = await chaincodeStub.getState(asset.ID);
  //         expect(ret).to.equal(undefined);
  //     });
  // });

  // describe('Test TransferAsset', () => {
  //     it('should return error on TransferAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         try {
  //             await assetTransfer.TransferAsset(transactionContext, 'asset2', 'Me');
  //             assert.fail('DeleteAsset should have failed');
  //         } catch (err) {
  //             expect(err.message).to.equal('The asset asset2 does not exist');
  //         }
  //     });

  //     it('should return success on TransferAsset', async () => {
  //         let assetTransfer = new AssetTransfer();
  //         await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

  //         await assetTransfer.TransferAsset(transactionContext, asset.ID, 'Me');
  //         let ret = JSON.parse((await chaincodeStub.getState(asset.ID)).toString());
  //         expect(ret).to.eql(Object.assign({}, asset, {Owner: 'Me'}));
  //     });
  // });

  // describe('Test GetAllAssets', () => {
  //     it('should return success on GetAllAssets', async () => {
  //         let assetTransfer = new AssetTransfer();

  //         await assetTransfer.CreateAsset(transactionContext, 'asset1', 'blue', 5, 'Robert', 100);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset2', 'orange', 10, 'Paul', 200);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset3', 'red', 15, 'Troy', 300);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset4', 'pink', 20, 'Van', 400);

  //         let ret = await assetTransfer.GetAllAssets(transactionContext);
  //         ret = JSON.parse(ret);
  //         expect(ret.length).to.equal(4);

  //         let expected = [
  //             {Record: {ID: 'asset1', Color: 'blue', Size: 5, Owner: 'Robert', AppraisedValue: 100}},
  //             {Record: {ID: 'asset2', Color: 'orange', Size: 10, Owner: 'Paul', AppraisedValue: 200}},
  //             {Record: {ID: 'asset3', Color: 'red', Size: 15, Owner: 'Troy', AppraisedValue: 300}},
  //             {Record: {ID: 'asset4', Color: 'pink', Size: 20, Owner: 'Van', AppraisedValue: 400}}
  //         ];

  //         expect(ret).to.eql(expected);
  //     });

  //     it('should return success on GetAllAssets for non JSON value', async () => {
  //         let assetTransfer = new AssetTransfer();

  //         chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
  //             if (!chaincodeStub.states) {
  //                 chaincodeStub.states = {};
  //             }
  //             chaincodeStub.states[key] = 'non-json-value';
  //         });

  //         await assetTransfer.CreateAsset(transactionContext, 'asset1', 'blue', 5, 'Robert', 100);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset2', 'orange', 10, 'Paul', 200);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset3', 'red', 15, 'Troy', 300);
  //         await assetTransfer.CreateAsset(transactionContext, 'asset4', 'pink', 20, 'Van', 400);

  //         let ret = await assetTransfer.GetAllAssets(transactionContext);
  //         ret = JSON.parse(ret);
  //         expect(ret.length).to.equal(4);

  //         let expected = [
  //             {Record: 'non-json-value'},
  //             {Record: {ID: 'asset2', Color: 'orange', Size: 10, Owner: 'Paul', AppraisedValue: 200}},
  //             {Record: {ID: 'asset3', Color: 'red', Size: 15, Owner: 'Troy', AppraisedValue: 300}},
  //             {Record: {ID: 'asset4', Color: 'pink', Size: 20, Owner: 'Van', AppraisedValue: 400}}
  //         ];

  //         expect(ret).to.eql(expected);
  //     });
  // });
})
