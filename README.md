# Freelance Milestone Escrow

A trust-minimized, decentralized milestone escrow protocol engineered on the Ethereum Virtual Machine (EVM). Features non-custodial milestone lockups, automated phase approvals, pull-over-push payouts, and neutral arbitration.

## Overview

Freelance Milestone Escrow enforces mathematical and financial integrity for contract engagements between independent Clients and Freelancers. Every agreement deployed through the protocol is governed by autonomous smart contract logic with zero intermediary custody.

### Core Protocol Principles
- **Strict Single-Role Architecture**: Every account is permanently bound to a single on-chain role (**Client**, **Freelancer**, or **Arbitrator**). This guarantees complete separation of powers, prevents conflicts of interest, and enforces rigorous access control at the smart contract level.
- **Milestone-Based Escrow**: Clients deposit 100% of the project commitment upfront into the contract. Funds are reserved phase-by-phase and released upon client verification of delivered milestones.
- **Pull-Over-Push Withdrawals**: Approved milestone payouts and arbitrated settlements are credited to an internal balance ledger. Recipients pull funds directly to their non-custodial wallet, completely preventing reentrancy attacks and denial-of-service blocking.
- **Accounting Invariant Guarantee**: The smart contract balance strictly equals active milestone reserves plus pending withdrawable credits at all times:
  $$\text{balance} == \text{totalReserved} + \sum \text{withdrawable}[u]$$
- **Neutral Arbitration**: Independent third-party arbitrators mediate contested milestones with zero-leakage percentage split settlements.

---

## Navigation & Workflows

### Pre-Sign In Navigation (Public Overview)
Before connecting an account, the public interface provides clear platform transparency:
- **How It Works**: Step-by-step breakdown of contract initiation, milestone deliverables, approval transitions, and payouts.
- **Features**: Single-role account architecture, non-custodial wallets, and milestone release schedules.
- **Security**: Smart contract audit specifications, invariant guarantees, and threat mitigations.

### Post-Sign In Navigation

#### Client Navigation
When authenticated with a Client account:
1. **Dashboard**: High-level portfolio metrics, active escrow commitments, pending review alerts, and recent transactions.
2. **My Projects**: Complete directory of commissioned escrow contracts with per-milestone progress tracking.
3. **Create Project**: Deployment portal for new multi-milestone escrow agreements with customizable deadlines and ETH allocations.
4. **Transactions**: On-chain ledger of all deployment, funding, approval, and refund events.
5. **Wallet**: Non-custodial wallet manager with live balance, copyable address, and account switcher.

#### Freelancer Navigation
When authenticated with a Freelancer account:
1. **Dashboard**: Assigned contract overview, earned milestones, and pending deliverables.
2. **My Projects**: All contracts where the account is designated as the primary deliverer.
3. **Milestone Submissions**: Dedicated deliverable console for attaching work notes, repository proofs, and tracking client reviews.
4. **Earnings**: Direct withdrawable balance manager with 1-click execution for pull-over-push payouts.
5. **Transactions**: Comprehensive event inspector for tracking release confirmations.
6. **Wallet**: Personal wallet management interface with balance verification and network status.

---

## Repository Structure

```text
├── contracts/
│   ├── FreelanceEscrow.sol           # Core milestone escrow state machine & accounting
│   └── EscrowFactory.sol             # Factory for provisioning and tracking escrows
├── frontend/
│   ├── src/                          # React components, state engine, and hooks
│   ├── public/                       # Assets and logo
│   ├── index.html                    # Web entry point
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.ts                # Frontend build configuration
│   └── tsconfig.json                 # TypeScript configuration
├── test/
│   ├── FreelanceEscrow.test.ts       # Lifecycle and pull withdrawal tests
│   ├── EscrowFactory.test.ts         # Factory deployment and indexing tests
│   ├── AccessControl.test.ts         # Role boundary and unauthorized call rejection
│   ├── AccountingInvariant.test.ts   # Financial invariant and zero-loss tests
│   └── DisputesAndRefunds.test.ts    # Dispute resolution and refund tests
├── ignition/
│   └── modules/
│       └── EscrowModule.ts           # Hardhat Ignition deployment definition
├── docs/
│   ├── architecture.md               # System design and component interactions
│   ├── platform-guide.md             # End-to-end platform user guide
│   └── threat-model.md               # Threat matrix, attack vectors & mitigations
├── hardhat.config.ts                 # Hardhat EVM network configuration
└── package.json                      # Workspace dependencies and scripts
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Contract Tests
Execute the comprehensive Hardhat test suite validating accounting invariants, access controls, and dispute scenarios:
```bash
npx hardhat test
```

### 3. Deploy via Hardhat Ignition
Deploy the EscrowFactory and initial showcase contracts to the local EVM node:
```bash
npx hardhat ignition deploy ignition/modules/EscrowModule.ts --network localhost
```

### 4. Run Frontend Application
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Security Audit & Invariant Guarantees
- **Reentrancy**: Protected by OpenZeppelin's `ReentrancyGuardUpgradeable` / `nonReentrant` modifier on all withdrawal endpoints.
- **Checks-Effects-Interactions**: Internal balances are cleared before external ETH transfers.
- **Zero Rounding Leakage**: Arbitrated dispute shares compute exact remainder refunds to guarantee zero wei is left unallocated.
