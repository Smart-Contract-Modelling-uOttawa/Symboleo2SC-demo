# Data Processing Agreement Contract
This folder contains the generated smart contract of the data processing agreement contract by the Symboleo2SC tool.

### [Data Processing Contract's text and specification.pdf](DataProcessingContractTextSpecification.pdf):
- The text summary of the agreement between the client and the data processor company.
- [The Symboleo specification of this agreement](AtosDataProcessing.symboleo).
- [nuXmv Model of the Data Processing Agreement](DataProcessingAgreement.smv)
# Testing
To test the generated smart contract using several scenarios illustrated in [DataProcessingAgreement.test.js](DataProcessingAgreement.test.js) :
- First, clone this repository using the `git clone` command or download the zip archive.
- Then, install dependencies.
```shell
cd Symboleo2SC-demo
npm install
```
- To test the generated smart contracts run the below commands:
```shell
npm test DataProcessingAgreement.test.js

```

