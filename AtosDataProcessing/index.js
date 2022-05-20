const { Contract } = require("fabric-contract-api") 
const { AtosDataProcessing } = require("./domain/contract/AtosDataProcessing.js")
const { deserialize, serialize } = require("./serializer.js")
const { Events } = require("symboleo-js-core")
const { InternalEvent, InternalEventSource, InternalEventType } = require("symboleo-js-core")
const { getEventMap, EventListeners } = require("./events.js")
class HFContract extends Contract {
  
  constructor() {
    super('AtosDataProcessing');
  }

  initialize(contract) {
    Events.init(getEventMap(contract), EventListeners)
  }

  async init(ctx, args) {
  	const inputs = JSON.parse(args);
    const contractInstance = new AtosDataProcessing (inputs.atos,inputs.client,inputs.inst,inputs.dType,inputs.dataPointId)
    this.initialize(contractInstance)
    if (contractInstance.activated()) {
      // call trigger transitions for legal positions
      contractInstance.obligations.oproccData.trigerredUnconditional()
  
      await ctx.stub.putState(contractInstance.id, Buffer.from(serialize(contractInstance)))
  
      return {successful: true, contractId: contractInstance.id}
    } else {
      return {successful: false}
    }
  }

  async trigger_processedData(ctx, args) {
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
      contract.processedData.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.processedData))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_adaptedInst(ctx, args) {
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
      contract.adaptedInst.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.adaptedInst))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_infringNotified(ctx, args) {
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
      contract.infringNotified.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.infringNotified))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_suspendNoticed(ctx, args) {
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
      contract.suspendNoticed.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.suspendNoticed))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_modifiedInst(ctx, args) {
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
      contract.modifiedInst.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.modifiedInst))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_recoProcessedData(ctx, args) {
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
      contract.recoProcessedData.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.recoProcessedData))
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
  
  async trigger_deliveredRecord(ctx, args) {
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
      contract.deliveredRecord.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.deliveredRecord))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_requestedRecord(ctx, args) {
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
      contract.requestedRecord.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.requestedRecord))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async p_psuspendPerformance_suspended_o_oproccData(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.psuspendPerformance != null && contract.powers.psuspendPerformance.isInEffect()) {
      const obligation = contract.obligations.oproccData
      if (obligation != null && obligation.suspended() && contract.powers.psuspendPerformance.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async p_presumPerformance_resumed_o_oproccData(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.presumPerformance != null && contract.powers.presumPerformance.isInEffect()) {
      const obligation = contract.obligations.oproccData
      if (obligation != null && obligation.resumed() && contract.powers.presumPerformance.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_oproccDataInst(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.oproccDataInst != null && contract.obligations.oproccDataInst.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_oadaptInst(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.oadaptInst != null && contract.obligations.oadaptInst.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_orecordData(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.orecordData != null && contract.obligations.orecordData.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_opaid(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.opaid != null && contract.obligations.opaid.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_odelRecord(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.odelRecord != null && contract.obligations.odelRecord.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_oproccData(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.oproccData != null && contract.obligations.oproccData.violated()) {      
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
    if (contract.processedData._triggered) {
      output += `  Event "processedData" happened at ${contract.processedData._timestamp}\r\n`
    } else {
      output += `  Event "processedData" has not happened\r\n`
    }
    if (contract.adaptedInst._triggered) {
      output += `  Event "adaptedInst" happened at ${contract.adaptedInst._timestamp}\r\n`
    } else {
      output += `  Event "adaptedInst" has not happened\r\n`
    }
    if (contract.infringNotified._triggered) {
      output += `  Event "infringNotified" happened at ${contract.infringNotified._timestamp}\r\n`
    } else {
      output += `  Event "infringNotified" has not happened\r\n`
    }
    if (contract.suspendNoticed._triggered) {
      output += `  Event "suspendNoticed" happened at ${contract.suspendNoticed._timestamp}\r\n`
    } else {
      output += `  Event "suspendNoticed" has not happened\r\n`
    }
    if (contract.modifiedInst._triggered) {
      output += `  Event "modifiedInst" happened at ${contract.modifiedInst._timestamp}\r\n`
    } else {
      output += `  Event "modifiedInst" has not happened\r\n`
    }
    if (contract.recoProcessedData._triggered) {
      output += `  Event "recoProcessedData" happened at ${contract.recoProcessedData._timestamp}\r\n`
    } else {
      output += `  Event "recoProcessedData" has not happened\r\n`
    }
    if (contract.paid._triggered) {
      output += `  Event "paid" happened at ${contract.paid._timestamp}\r\n`
    } else {
      output += `  Event "paid" has not happened\r\n`
    }
    if (contract.deliveredRecord._triggered) {
      output += `  Event "deliveredRecord" happened at ${contract.deliveredRecord._timestamp}\r\n`
    } else {
      output += `  Event "deliveredRecord" has not happened\r\n`
    }
    if (contract.requestedRecord._triggered) {
      output += `  Event "requestedRecord" happened at ${contract.requestedRecord._timestamp}\r\n`
    } else {
      output += `  Event "requestedRecord" has not happened\r\n`
    }
    
    return output
  }
}

module.exports.contracts = [HFContract];
