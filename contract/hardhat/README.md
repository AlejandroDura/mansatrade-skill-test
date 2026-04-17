# MansaTrade Skill Test

## 📄 Description

This project consists of a skill test performed to the MansaTrade smart contract.

## 🎯 Objectives

Perform a unit test to the createOffer function using hardhat.

## 🗂️ Project structure

The test can be found in:

- test/MansatradeTest.ts

The contracts used in:

- contracts/Mocks
- contracts/mansatrade.sol

## 🛠️ Thech Stack

- Solidity
- Hardhat3 + Viem

## ▶️ How to Run
- Clone the repository

```bash
git clone https://github.com/AlejandroDura/mansatrade-skill-test.git
```
```bash
cd mansatrade-skill-test
```

- Install dependencies

```bash
npm install
```

- Compile project

```bash
npx hardhat compile
```
- Start a hardhat node in a new terminal

```bash
npx hardhat node
```

- Run the test

```bash
npx hardhat test test/MansatradeTest.ts
```

