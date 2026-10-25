# Freelance Milestone Escrow

A trust-minimized, decentralized milestone escrow protocol engineered on the Ethereum Virtual Machine (EVM). Built with **Solidity ^0.8.24**, **OpenZeppelin Contracts v5** (`ReentrancyGuard`), **Hardhat & Hardhat Ignition**, **ethers.js v6**, and **React 19 + TypeScript + Tailwind CSS**.

---

## 1. Overview & Protocol Principles

**Freelance Milestone Escrow** enforces mathematical and financial integrity for contract engagements between independent Clients, Freelancers, and Arbitrators. Every agreement deployed through `EscrowFactory.sol` creates an isolated, non-custodial `FreelanceMilestoneEscrow.sol` smart contract instance with zero intermediary custody.

### Core Architectural Guarantees
- **Strict Single-Role Architecture (3 Dedicated Accounts)**: Every participant wallet is permanently bound to a single role (**Client**, **Freelancer**, or **Arbitrator**). This guarantees complete separation of powers, prevents role-confusion or self-arbitration conflicts, and enforces rigorous access control via on-chain modifiers (`onlyClient`, `onlyFreelancer`, `onlyArbitrator`).
- **OpenZeppelin Security Standard**: Inherits `@openzeppelin/contracts/utils/ReentrancyGuard.sol` (`contract FreelanceMilestoneEscrow is ReentrancyGuard`) combined with the Checks-Effects-Interactions (CEI) pattern.
- **100% Upfront Milestone Lockup**: Clients deposit 100% of the agreement commitment upfront (`fundAgreement()`). Funds are reserved phase-by-phase and unlocked only upon verified milestone approval or neutral arbitration.
- **Pull-Over-Push Withdrawals**: Approved milestone payouts and arbitrated settlements credit an internal ledger (`mapping(address => uint256) public withdrawable`). Beneficiaries pull funds directly to their non-custodial wallet via `withdraw() external nonReentrant`, eliminating reentrancy and Denial-of-Service (DoS) vectors.
- **Mathematical Solvency Invariant**: At every block and state transition, the contract's ETH balance strictly equals active milestone reserves plus pending withdrawable credits:
  $$\text{address(this).balance} == \text{totalReserved} + \sum_{u} \text{withdrawable}[u]$$
- **Zero-Leakage Basis-Point Arbitration**: Contested milestones are resolved by the designated Arbitrator using basis points ($0 \dots 10000\text{ bps}$), with exact remainder derivation (`clientRefund = amount - freelancerShare`) so zero wei is ever trapped.

---

## 2. Pre-Configured Single-Role Accounts

For clean evaluation and live demonstration, the protocol maintains **3 dedicated single-role Hardhat accounts** (Chain ID `31337`):

| Role | Name | Handle | Wallet Address | Private Key (Local Testnet Only) |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | **Alex** | `@alex.eth` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Freelancer** | **Stark** | `@stark.eth` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Arbitrator** | **Mark** | `@mark.eth` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

---

## 3. Repository Structure

```text
├── contracts/
│   ├── FreelanceMilestoneEscrow.sol         # Core milestone escrow state machine (OpenZeppelin ReentrancyGuard)
│   └── EscrowFactory.sol                    # Factory contract for deploying & indexing escrow instances
├── ignition/
│   └── modules/
│       └── FreelanceMilestoneEscrow.cjs     # Hardhat Ignition declarative deployment module
├── scripts/
│   └── deploy.cjs                           # Standard Hardhat deployment script
├── test/
│   ├── FreelanceMilestoneEscrow.test.cjs    # End-to-end lifecycle & pull-over-push withdrawal tests
│   ├── EscrowFactory.test.cjs               # Factory deployment & user indexing tests
│   ├── AccessControl.test.cjs               # Role boundary & unauthorized caller rejection tests
│   ├── AccountingInvariant.test.cjs         # Formal solvency invariant & zero-dust verification
│   └── DisputesAndRefunds.test.cjs          # Basis-point arbitration & unstarted refund tests
├── frontend/
│   ├── src/
│   │   ├── components/                      # Role-gated React views, modals, and receipt inspectors
│   │   ├── services/
│   │   │   ├── web3Service.ts               # ethers.js v6 BrowserProvider, JsonRpcProvider & ABIs
│   │   │   └── evmEngine.ts                 # EVM state synchronization & transaction execution engine
│   │   └── types/
│   │       └── escrow.ts                    # TypeScript interfaces for agreements, milestones & receipts
│   └── index.html                           # Frontend entry point
├── docs/
│   ├── architecture.md                      # Detailed system & smart contract architecture
│   ├── platform-guide.md                    # End-to-end user & role workflow guide
│   └── threat-model.md                      # Security specification, threat matrix & mitigations
├── LOCAL_DEMO_GUIDE.md                      # Step-by-step local walkthrough with Hardhat & MetaMask
├── hardhat.config.cjs                       # Hardhat EVM configuration (Solidity 0.8.24, Chain ID 31337)
└── package.json                             # Project dependencies & scripts
```

---

## 4. Quick Start & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Smart Contracts & Run Automated Test Suite
Execute all 5 Hardhat test suites validating OpenZeppelin `ReentrancyGuard`, role-based access control, solvency invariants, and dispute resolution:
```bash
npx hardhat test
```

### 3. Start Local Hardhat Node & Deploy Contracts (Optional for Live RPC / MetaMask)
In Terminal 1:
```bash
npx hardhat node
```
In Terminal 2 (deploy via Hardhat Ignition):
```bash
npx hardhat ignition deploy ignition/modules/FreelanceMilestoneEscrow.cjs --network localhost
```

### 4. Start the Frontend Application
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 5. Documentation Index
- [**System Architecture**](./docs/architecture.md) — Component topology, OpenZeppelin & ethers.js v6 integration, state machines, and solvency equations.
- [**Platform Guide**](./docs/platform-guide.md) — Step-by-step workflows for **Alex** (Client), **Stark** (Freelancer), and **Mark** (Arbitrator).
- [**Security & Threat Model**](./docs/threat-model.md) — Formal threat analysis, attack vectors, and smart contract mitigations.
- [**Local Demo Guide**](./LOCAL_DEMO_GUIDE.md) — Complete instructions for live demonstration with Hardhat (`127.0.0.1:8545`) and MetaMask.
