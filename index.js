const { Contract } = require("fabric-contract-api") 
const { MeatSale } = require("./domain/contract/MeatSale.js")
const { deserialize, serialize } = require("./serializer.js")
const { Events } = require("symboleo-js-core")
const { InternalEvent, InternalEventSource, InternalEventType } = require("symboleo-js-core")
const { getEventMap, EventListeners } = require("./events.js")
class HFContract extends Contract {
  
  constructor() {
    super('MeatSale');
  }

  initialize(contract) {
    Events.init(getEventMap(contract), EventListeners)
  }

  async init(ctx, args) {
  	const inputs = JSON.parse(args);
    const contractInstance = new MeatSale (inputs.buyer,inputs.seller,inputs.qnt,inputs.qlt,inputs.amt,inputs.curr,inputs.payDueDate,inputs.delAdd,inputs.effDate,inputs.delDueDateDays,inputs.interestRate)
    this.initialize(contractInstance)
    if (contractInstance.activated()) {
      // call triggeredUnconditional for legal positions
      contractInstance.obligations.delivery.trigerredUnconditional()
      contractInstance.obligations.payment.trigerredUnconditional()
  
      // call triggeredConditional for legal positions
  
      await ctx.stub.putState(contractInstance.id, Buffer.from(serialize(contractInstance)))
  
      return {successful: true, contractId: contractInstance.id}
    } else {
      return {successful: false}
    }
  }

  async trigger_delivered(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()) {
      contract.delivered.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paidLate(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()) {
      contract.paidLate.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paid(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()) {
      contract.paid.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async power_suspendedObligation_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isInEffect()) {
      const obligation = contractState.obligations.delivery
      if (obligation != null && obligation.suspended() && contract.powers.suspendDelivery.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async power_resumedObligation_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.isInEffect()) {
      const obligation = contractState.obligations.delivery
      if (obligation != null && obligation.resumed() && contract.powers.resumeDelivery.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async power_terminatedContract(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.terminateContract != null && contract.powers.terminateContract.isInEffect()) {
      for (let index in contract.obligations) {
        const obligation = contract.obligations[index]
        obligation.terminated()
      }
      for (let index in contract.survivingObligations) {
        const obligation = contract.survivingObligations[index]
        obligation.terminated()
      }
      for (let index in contract.powers) {
        const power = contract.powers[index]
        if (index === 'terminateContract') {
          continue;
        }
        power.terminated()
      }        
      if (contract.terminated() && contract.powers.terminateContract.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_latePayment(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.latePayment != null && contract.obligations.latePayment.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.delivery != null && contract.obligations.delivery.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_payment(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.payment != null && contract.obligations.payment.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  
  async getState(ctx, contractId) {
  	const contractState = await ctx.stub.getState(contractId)
  	if (contractState == null) {
  	  return {successful: false}
  	}
  	const contract = deserialize(contractState.toString())
  	this.initialize(contract)
  	let output = `Contract state: ${contract.state}-${contract.activeState}\r\n`
  	output += 'Obligations:\r\n'
  	for (const obligationKey of Object.keys(contract.obligations)) {
      output += `  ${obligationKey}: ${contract.obligations[obligationKey].state}-${contract.obligations[obligationKey].activeState}\r\n`
    }
    output += 'Powers:\r\n'
    for (const powerKey of Object.keys(contract.powers)) {
      output += `  ${powerKey}: ${contract.powers[powerKey].state}-${contract.powers[powerKey].activeState}\r\n`
    }
    output += 'Surviving Obligations:\r\n'
    for (const obligationKey of Object.keys(contract.survivingObligations)) {
      output += `  ${obligationKey}: ${contract.survivingObligations[obligationKey].state}-${contract.survivingObligations[obligationKey].activeState}\r\n`
    }
    output += 'Events:\r\n'
    if (contract.delivered._triggered) {
      output += `  Event "delivered" happened at ${contract.delivered._timestamp}\r\n`
    } else {
      output += `  Event "delivered" has not happened\r\n`
    }
    if (contract.paidLate._triggered) {
      output += `  Event "paidLate" happened at ${contract.paidLate._timestamp}\r\n`
    } else {
      output += `  Event "paidLate" has not happened\r\n`
    }
    if (contract.paid._triggered) {
      output += `  Event "paid" happened at ${contract.paid._timestamp}\r\n`
    } else {
      output += `  Event "paid" has not happened\r\n`
    }
    
    return output
  }
}

module.exports.contracts = [HFContract];
