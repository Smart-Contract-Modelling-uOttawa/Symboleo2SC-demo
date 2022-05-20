const { Contract } = require("fabric-contract-api") 
const { TransactiveEnergyAgreement } = require("./domain/contract/TransactiveEnergyAgreement.js")
const { deserialize, serialize } = require("./serializer.js")
const { Events } = require("symboleo-js-core")
const { InternalEvent, InternalEventSource, InternalEventType } = require("symboleo-js-core")
const { getEventMap, EventListeners } = require("./events.js")
class HFContract extends Contract {
  
  constructor() {
    super('TransactiveEnergyAgreement');
  }

  initialize(contract) {
    Events.init(getEventMap(contract), EventListeners)
  }

  async init(ctx, args) {
  	const inputs = JSON.parse(args);
    const contractInstance = new TransactiveEnergyAgreement (inputs.caiso,inputs.derp)
    this.initialize(contractInstance)
    if (contractInstance.activated()) {
      // call trigger transitions for legal positions
      contractInstance.powers.terminateAgreementBySupplier.trigerredConditional()
  
      await ctx.stub.putState(contractInstance.id, Buffer.from(serialize(contractInstance)))
  
      return {successful: true, contractId: contractInstance.id}
    } else {
      return {successful: false}
    }
  }

  async trigger_bidAccepted(ctx, args) {
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
      contract.bidAccepted.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.bidAccepted))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_energySupplied(ctx, args) {
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
      contract.energySupplied.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.energySupplied))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_caisoTerminationNoticeIssued(ctx, args) {
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
      contract.caisoTerminationNoticeIssued.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.caisoTerminationNoticeIssued))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_derpTerminationNoticeIssued(ctx, args) {
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
      contract.derpTerminationNoticeIssued.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.derpTerminationNoticeIssued))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_creditInvoiceIssued(ctx, args) {
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
      contract.creditInvoiceIssued.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.creditInvoiceIssued))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_isoPaid(ctx, args) {
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
      contract.isoPaid.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.isoPaid))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_penaltyInvoiceIssued(ctx, args) {
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
      contract.penaltyInvoiceIssued.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.penaltyInvoiceIssued))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paidPenalty(ctx, args) {
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
      contract.paidPenalty.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidPenalty))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async p_terminateAgreement_terminated_contract(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.terminateAgreement != null && contract.powers.terminateAgreement.isInEffect()) {
      for (let index in contract.obligations) {
        const obligation = contract.obligations[index]
        obligation.terminated({emitEvent: false})
      }
      for (let index in contract.survivingObligations) {
        const obligation = contract.survivingObligations[index]
        obligation.terminated()
      }
      for (let index in contract.powers) {
        const power = contract.powers[index]
        if (index === 'terminateAgreement') {
          continue;
        }
        power.terminated()
      }        
      if (contract.terminated() && contract.powers.terminateAgreement.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async p_terminateAgreementBySupplier_terminated_contract(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.terminateAgreementBySupplier != null && contract.powers.terminateAgreementBySupplier.isInEffect()) {
      for (let index in contract.obligations) {
        const obligation = contract.obligations[index]
        obligation.terminated({emitEvent: false})
      }
      for (let index in contract.survivingObligations) {
        const obligation = contract.survivingObligations[index]
        obligation.terminated()
      }
      for (let index in contract.powers) {
        const power = contract.powers[index]
        if (index === 'terminateAgreementBySupplier') {
          continue;
        }
        power.terminated()
      }        
      if (contract.terminated() && contract.powers.terminateAgreementBySupplier.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async p_imposePenalty_triggered_o_payPenalty(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.imposePenalty != null && contract.powers.imposePenalty.isInEffect()) {
      if (contract.powers.imposePenalty.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_paybyISO(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.paybyISO != null && contract.obligations.paybyISO.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_supplyEnergy(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.supplyEnergy != null && contract.obligations.supplyEnergy.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_payPenalty(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.payPenalty != null && contract.obligations.payPenalty.violated()) {      
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
    if (contract.bidAccepted._triggered) {
      output += `  Event "bidAccepted" happened at ${contract.bidAccepted._timestamp}\r\n`
    } else {
      output += `  Event "bidAccepted" has not happened\r\n`
    }
    if (contract.energySupplied._triggered) {
      output += `  Event "energySupplied" happened at ${contract.energySupplied._timestamp}\r\n`
    } else {
      output += `  Event "energySupplied" has not happened\r\n`
    }
    if (contract.caisoTerminationNoticeIssued._triggered) {
      output += `  Event "caisoTerminationNoticeIssued" happened at ${contract.caisoTerminationNoticeIssued._timestamp}\r\n`
    } else {
      output += `  Event "caisoTerminationNoticeIssued" has not happened\r\n`
    }
    if (contract.derpTerminationNoticeIssued._triggered) {
      output += `  Event "derpTerminationNoticeIssued" happened at ${contract.derpTerminationNoticeIssued._timestamp}\r\n`
    } else {
      output += `  Event "derpTerminationNoticeIssued" has not happened\r\n`
    }
    if (contract.creditInvoiceIssued._triggered) {
      output += `  Event "creditInvoiceIssued" happened at ${contract.creditInvoiceIssued._timestamp}\r\n`
    } else {
      output += `  Event "creditInvoiceIssued" has not happened\r\n`
    }
    if (contract.isoPaid._triggered) {
      output += `  Event "isoPaid" happened at ${contract.isoPaid._timestamp}\r\n`
    } else {
      output += `  Event "isoPaid" has not happened\r\n`
    }
    if (contract.penaltyInvoiceIssued._triggered) {
      output += `  Event "penaltyInvoiceIssued" happened at ${contract.penaltyInvoiceIssued._timestamp}\r\n`
    } else {
      output += `  Event "penaltyInvoiceIssued" has not happened\r\n`
    }
    if (contract.paidPenalty._triggered) {
      output += `  Event "paidPenalty" happened at ${contract.paidPenalty._timestamp}\r\n`
    } else {
      output += `  Event "paidPenalty" has not happened\r\n`
    }
    
    return output
  }
}

module.exports.contracts = [HFContract];
