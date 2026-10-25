# 🚀 Local Demonstration & Architecture Guide

This guide provides step-by-step instructions to run and demonstrate the **Freelance Milestone Escrow** project locally using **Solidity ^0.8.24**, **OpenZeppelin Contracts v5** (`ReentrancyGuard`), **Hardhat & Hardhat Ignition**, **ethers.js v6**, **MetaMask**, and **React 19 + TypeScript + Vite + Tailwind CSS**.

---

## 🛠️ System Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│         React 19 + TypeScript + Vite + Tailwind         │
│               (Frontend Web Application)                │
└────────────────────────────┬────────────────────────────┘
                             │
             ethers.js v6 (BrowserProvider / JsonRpcProvider)
             ABI Encoding via ethers.Interface
                             │
┌────────────────────────────▼────────────────────────────┐
│              Local Hardhat Ethereum Node                │
│                 http://127.0.0.1:8545                   │
│                     (Chain ID 31337)                    │
└────────────────────────────┬────────────────────────────┘
                             │
     ┌───────────────────────┴───────────────────────┐
     │                                               │
┌────▼─────────────────┐           ┌─────────────────▼────────┐
│  EscrowFactory.sol   │           │FreelanceMilestoneEscrow  │
│  (Factory Contract)  │──────────►│.sol (is ReentrancyGuard) │
└──────────────────────┘           └──────────────────────────┘
```

---

## 📋 Step-by-Step Execution Instructions

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

---

### Step 2: Start the Local Hardhat Ethereum Blockchain
In **Terminal 1**, start the local Hardhat network listening on `http://127.0.0.1:8545`:
```bash
npx hardhat node
```
> **Note:** Keep this terminal running during your demo. Whenever you execute actions in the frontend (`createAgreement`, `fundAgreement`, `submitMilestone`, `approveMilestone`, `raiseDispute`, `resolveDispute`, `withdraw`), `ethers.js v6` broadcasts transactions directly to `http://127.0.0.1:8545` so you can see real-time transaction hashes, block numbers, and gas metrics logged in this terminal.

---

### Step 3: Compile Smart Contracts & Deploy via Hardhat Ignition
In **Terminal 2**, deploy the contracts using **Hardhat Ignition**:

```bash
npx hardhat ignition deploy ignition/modules/FreelanceMilestoneEscrow.cjs --network localhost
```

*(Alternative)* Deploy using the standard Hardhat script:
```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

---

### Step 4: Run the Smart Contract Unit Test Suite
Verify that all 5 test suites (`FreelanceMilestoneEscrow.test.cjs`, `EscrowFactory.test.cjs`, `AccessControl.test.cjs`, `AccountingInvariant.test.cjs`, `DisputesAndRefunds.test.cjs`) pass with 100% assertions:
```bash
npx hardhat test
```

---

### Step 5: Start the Frontend Application
In **Terminal 2**, start the React + Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### Step 6: Connect MetaMask (Optional for Live Browser Wallet Sync)
1. In MetaMask, add or switch to the local Hardhat network (the app also auto-prompts this via `wallet_addEthereumChain` when you click **Connect MetaMask**):
   - **Network Name:** `Hardhat Localhost 8545`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337` (`0x7a69`)
   - **Currency Symbol:** `ETH`
2. Import any of the 3 dedicated role accounts below using its private key.
3. In the React app, click **Connect Your Wallet** $\rightarrow$ **Connect MetaMask** (or select one of the 3 single-role accounts directly).

---

## 🔑 Dedicated Single-Role Hardhat Accounts

The platform enforces a **Strict Single-Role Architecture** with 1 account per role and **zero mock agreements** on startup:

| Role | Account Name | Handle | Address | Private Key |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | **Alex** | `@alex.eth` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Freelancer** | **Stark** | `@stark.eth` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Arbitrator** | **Mark** | `@mark.eth` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

---

## 🌟 Key Technical Highlights for Evaluators

1. **OpenZeppelin Security (`@openzeppelin/contracts`):** `FreelanceMilestoneEscrow.sol` inherits OpenZeppelin's `ReentrancyGuard` (`nonReentrant`) and follows the Checks-Effects-Interactions (CEI) pattern on all `withdraw()` calls.
2. **ethers.js v6 Integration:** Uses `ethers.BrowserProvider`, `ethers.JsonRpcProvider`, `ethers.Wallet`, `ethers.Interface` ABI encoding, `ethers.parseEther` / `ethers.formatEther`, and `ethers.keccak256`.
3. **Pull-Over-Push EVM Withdrawals:** Client approvals credit `withdrawable[freelancer]` without pushing external ETH transfers during approval, preventing reentrancy and DoS attacks.
4. **Basis-Point Dispute Resolution:** Neutral dispute settlement via a `0–10,000 bps` slider with exact integer subtraction (`clientRefund = amount - freelancerShare`) guaranteeing zero wei remainder leakage.
5. **Formal Solvency Invariant:** Real-time verification that `address(this).balance == totalReserved + sum(withdrawable)` at every state transition.
