# Testing
This document explains the additions and testing of newly introduced grammar extensions for the Symboleo language, specifically targeting enhanced JavaScript and nuXmv support.

**Unit Testing Framework**

- All JavaScript test cases are implemented using Mocha as the test runner and Chai for assertions.
- Main test file:

    - test/MeatSaleOperators.test.js - [Link to the test file](https://github.com/Smart-Contract-Modelling-uOttawa/Symboleo2SC-demo/blob/main/test/MeatSaleOperators.test.js)

**Examples Tested**

The following functions were added and tested:

-> New Arithmetic Operator:

`%` (modulo) operator — validated within arithmetic expressions.

-> Two-argument functions:
- Math.pow(a, b)
- Math.max(a, b)
- Math.min(a, b)

-> One-argument functions:
 - Math.abs(x)
 - Math.floor(x)
 - Math.cbrt(x)
 - Math.ceil(x)
 - Math.exp(x)
 - Math.sign(x)
 - Math.sqrt(x)

-> Logical proposition evaluation: (Proposition Arithmetic)

Tests were written to ensure correct handling of complex logical propositions involving arithmetic operations, such as:
```shell
contract.paidLate.amount < contract.paid.amount + 100
```


**Running the tests**
1. Install dependencies(if not already):
```shell
cd Symboleo2SC-demo
npm install
```
2. Run the test
```shell
npm test test/MeatSaleOperators.test.js
```
This command will run all test suites and display the results in the console.
