# To convert Symboleo specification to smv module:
1- change all the environment attributes to normal attributes and add them to the contract parameters as their values will be passed through these parameters.
Notice that when you changed all the ENV attributes to normal attributes, errors will appear in the Declaration section where you have to assign values to some of those attributes. Don't assign values but assign variables to those attributes and add them to the contract as parameters.
 e.g. Contract DataProcessingAgreement (atos: Processor, client: Controller, instruction: Instruction, dataId: String, dataPoint: Data, amount: Number)
2- be sure all the assets have owner attribute of type of role (i.e., Processor, Controller)
   e.g. Data isAn Asset with id: String, content: String, owner: Controller;
3- Then save the file.symboleo. The smv model will be created.
# To execute it:
- go to MODULE Event and change the name of performers to your roles' names that are used in the domain section. 

	- performer	: {"CBEEF", "COSTCO"};  -->  performer: {"Processor", "Controller"}; 
	- state=active & start	: {"CBEEF", "COSTCO"}; --> state=active & start: {"Processor", "Controller"};
3- Under contract section. In the contract module, add the two parties as parameters too.
	For example MODULE DataProcessingAgreement (atos, client, instruction, dataId, dataPoint, amount)
	--> will be:
	 MODULE DataProcessingAgreement (atos, client, instruction, dataId, dataPoint, amount)
4- To pass the expected values of the parameters, create the main model that includes all the variable declarations and their expected values. Also, you can assign specific values if you want to test a specific scenario.
5- Pass the values to the contract via its parameters.
	For example:
	```
	MODULE main
	
	FROZENVAR
	
	origin: {"DataSubject", "Customer", "ExectingProcessing", "DataBroker", "OnlinePlatform", "ExternalSource", "ThirdParty", "Other"};
	region: {"EU", "APAC", "BTN", "MEA", "MAD", "SAM"};
	categorySubjects: {"Employees", "Customers", "Providers", "EndUsers", "Members", "Visitors", "Other"};
	processingActitvity: {"Collection", "Recording", "Organization", "Structuring", "Storage", "Adaption", "Retrieval", "RemoteAccess", "Consultation",
	  	                             "Use", "Disclosure", "Others"}; 
	dataId: {1, 3, 4, 5};
	
	VAR
		amount : real;
		isPersonal : boolean;
		
	-- CONSTRAINTS
		INVAR 10000.0 <= amount & amount <= 10500.0;
		
	VAR
	atos: Processor("Processor");
	client: Controller("Controller");
	instruction:  Instruction(origin, region, categorySubjects,processingActitvity, isPersonal, "Controller");
	dataPoint: Data(dataId, "Data need to be processed", "Controller");
	DataProcessing_cnt : DataProcessingAgreement(atos, client, instruction, dataId, dataPoint, amount);
	--- This is the first liveness property you have to test
	--* Number      : P1
	--* Description : A contract eventually terminates.
	--* Type        : Desirable property
	LTLSPEC NAME LTL11 := F(DataProcessing_cnt.cnt.state = sTermination | DataProcessing_cnt.cnt.state = unsTermination)
 ~~~


