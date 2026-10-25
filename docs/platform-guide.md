# Freelance Milestone Escrow — Platform Guide

This document outlines the end-to-end operation, navigation flows, and role responsibilities for the Freelance Milestone Escrow platform.

---

## 1. Role System & Account Separation

The platform utilizes a **Strict Single-Role Architecture**. Each non-custodial wallet account is assigned exactly one permanent role to maintain strict separation of powers and avoid conflicts of interest:

### Client Accounts
- **Core Purpose**: Commission projects, define milestone schedules, and finance escrow contracts.
- **Dedicated Navigation**:
  - `Dashboard`: Live portfolio summary, milestone review counters, total locked ETH.
  - `My Projects`: Detailed list of all commissioned contracts and their current progress.
  - `Create Project`: Deploy a new multi-milestone contract with customized deadlines and funding.
  - `Transactions`: Complete audit log of funding receipts, milestone approvals, and refunds.
  - `Wallet`: Non-custodial wallet balance, address copying, and account switcher.

### Freelancer Accounts
- **Core Purpose**: Complete project scope, submit verifiable deliverable proofs, and pull earned payouts.
- **Dedicated Navigation**:
  - `Dashboard`: Active contract metrics, upcoming deadlines, and withdrawable earnings overview.
  - `My Projects`: Contracts where the account is designated as the freelancer.
  - `Milestone Submissions`: Dedicated workbench for attaching work proofs and notes.
  - `Earnings`: Direct withdrawal interface with 1-click execution for pull-over-push payouts.
  - `Transactions`: Real-time transaction inspection and payment confirmation receipts.
  - `Wallet`: Personal wallet balance and network connectivity view.

### Arbitrator Accounts
- **Core Purpose**: Independent dispute resolution guardian.
- **Dedicated Navigation**:
  - `Dashboard`: Case summary, dispute metrics, and resolution timeline.
  - `Active Disputes`: Mediation console for reviewing evidence and allocating settlement shares.
  - `Transactions`: Settlement transaction history.
  - `Wallet`: Non-custodial wallet management.

---

## 2. Public Pre-Sign In Navigation
Prior to wallet connection, visitors have immediate access to key platform documentation via the floating capsule menu:
- **How It Works**: Comprehensive guide to the 4-step escrow lifecycle (Define & Fund -> Deliver Work -> Review & Approve -> Withdraw Earnings).
- **Features**: Explanation of milestone schedules, non-custodial protection, and single-role profiles.
- **Security**: Invariant guarantees, audit specifications, and smart contract protections.

---

## 3. End-to-End Escrow Lifecycle

### Step 1: Project Agreement Creation (Client)
A Client opens **Create Project** and specifies:
1. Agreement Title (e.g., "Full-Stack Web3 Application Development")
2. Freelancer Wallet Address (selected from registered Freelancer accounts)
3. Arbitrator Wallet Address (designated neutral mediator)
4. Milestone Schedule (1 to 10 phases, each with title, ETH allocation, and deadline)

### Step 2: Escrow Funding (Client)
Upon creation, the contract is in the `Unfunded` state. The Client executes `fundAgreement`, depositing the exact sum of all milestone allocations into the contract. Funds are securely locked in smart contract custody.

### Step 3: Deliverable Submission (Freelancer)
When work for a milestone is complete, the Freelancer navigates to **Milestone Submissions**, attaches deliverable notes, documentation links, or repository references, and executes `submitMilestone`.

### Step 4: Review & Payment Approval (Client)
The Client inspects the submitted deliverable:
- **Approval**: If satisfied, the Client triggers `approveMilestone`. The milestone transitions to `Released`, and the exact milestone amount is credited to the Freelancer's `withdrawable` balance.
- **Dispute**: If requirements are contested, either party can trigger `raiseDispute`, escalating the milestone to the **Resolution Center**.

### Step 5: Dispute Resolution (Arbitrator)
The designated Arbitrator reviews evidence from both parties and issues a percentage split allocation (0% to 100%). The smart contract distributes the allocation without fractional leakage:
$$\text{freelancerShare} = \lfloor \text{amount} \times \text{bps} / 10000 \rfloor, \quad \text{clientRefund} = \text{amount} - \text{freelancerShare}$$

### Step 6: Non-Reentrant Payout Withdrawal
Beneficiaries navigate to **Earnings** or **Wallet** and trigger `withdraw()`. The smart contract uses the pull-over-push security pattern to zero the internal credit before transferring ETH, completely eliminating reentrancy vulnerabilities.
