# Freelance Milestone Escrow — System Implementation Plan

A local-first, educational Web3 smart-contract decentralized application (dApp) for freelance milestone escrow agreements, enforcing role-based permissions, pull-over-push withdrawal accounting, dispute resolution via basis points, and comprehensive transaction inspection for academic presentation.

### User Review & Critical Decisions

> [!IMPORTANT]
> The project strictly follows the specification defined in `Freelance_Milestone_Escrow_PRD_e5100a8e.md`. All financial accounting, state machines, and access control boundaries are enforced at the smart-contract layer in Solidity.

- **Confirmed Decision 1 (Core Focus)**: Smart-contract-first development with strict accounting invariants, checks-effects-interactions, and pull-over-push withdrawal credits rather than push transfers.
- **Confirmed Decision 2 (Execution Architecture)**: Dual-mode execution engine providing:
  1. An embedded, deterministic in-browser EVM execution engine that simulates the exact Solidity contracts, gas calculation, block mining, cryptographic transaction hashes, receipts, and event logs directly inside the AI Studio web preview with pre-funded Hardhat accounts (Accounts 0–3).
  2. Complete, standalone Solidity source files (`FreelanceEscrow.sol`, `EscrowFactory.sol`), Hardhat configuration, automated unit/invariant tests, and deployment scripts for terminal evaluation and local Hardhat node execution on a laptop.
- **Confirmed Decision 3 (Demo Script & Academic Artifacts)**: Dedicated Academic Submission & Demo Hub inside the application with live step-by-step 5–8 minute presentation controls, contract source code inspector, ABI explorer, threat model, and full project export.

---

### 1. Overview & Core Concept

- **What It Does**: Allows a Client to create a multi-milestone freelance agreement via an `EscrowFactory`, deposit the exact total ETH required, review submissions from a Freelancer, and release funds into withdrawable credits. Freelancers submit proof of work and withdraw accumulated credits. In the event of a disagreement, either party can raise an on-chain dispute, allowing a designated Arbitrator to allocate funds in basis points (0–10,000 bps) between the parties without rounding loss.
- **Target Audience / Persona**: Academic evaluators, professors, peers, and Web3 developers observing a live classroom demonstration of secure Solidity escrow mechanics.
- **Key Value**: Replaces opaque off-chain freelance intermediaries with inspectable, immutable state machine rules where every payout, dispute split, and refund maintains strict accounting invariants:
  $$\text{Contract Balance} = \sum \text{Reserved Funds} + \sum \text{Withdrawable Credits}$$

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Account Switching**: The user toggles between disposable Hardhat accounts (Client A, Freelancer A, Arbitrator, and Attacker / Client B) in the top bar to test both authorized workflows and on-chain permission rejections.
2. **Agreement Creation**: Client specifies Freelancer address, Arbitrator address, title, and 1–10 milestone rows with amounts and deadlines. The interface verifies address validity and distinctness, computes total funding required, and executes creation through `EscrowFactory`.
3. **Funding Deposit**: Client executes exact funding in a single transaction. Contract state transitions from `Unfunded` to `Active`, and funds transition to `totalReserved`.
4. **Milestone Lifecycle**:
   - Freelancer submits delivery notes for a `Pending` milestone before deadline $\rightarrow$ `Submitted`.
   - Client approves work $\rightarrow$ `Released` (amount moves from `totalReserved` to Freelancer's `withdrawable` credit).
   - Freelancer triggers `withdraw()` $\rightarrow$ executes checks-effects-interactions ETH transfer to wallet.
5. **Dispute & Arbitration Flow**:
   - Client or Freelancer disputes a `Submitted` milestone $\rightarrow$ `Disputed`.
   - Arbitrator enters Freelancer share percentage (0–100% $\equiv$ 0–10,000 bps); preview calculates exact split and remainder.
   - Arbitrator calls `resolveDispute()` $\rightarrow$ allocates withdrawable credits to Freelancer and Client; milestone becomes `Resolved`.
6. **Controlled Refund**: Client requests refund for an eligible `Pending` milestone $\rightarrow$ amount credits to Client withdrawable balance; milestone becomes `Refunded`.
7. **Transaction Verification**: Every operation yields a mined block, transaction hash, gas used, emitted event logs, and updated on-chain balances in the Transaction Inspector.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-integrity Web3 engineering dashboard with fintech restraint. Clean borders, dark slate typography, and subdued indigo/slate accents. No AI-slop gradients, decorative pulsing dots, or fabricated scoreboards.
- **Color Palette**:
  - Dominant Neutral Field: Clean crisp slate/zinc background (`#F8FAFC` light / `#0B0F19` dark)
  - Structural Surfaces: Flat cards with 1px border lines (`border-slate-200` / `border-slate-800`), zero card-in-card nesting
  - Primary Action Accent: Professional deep indigo (`#4F46E5` / `#4338CA`)
  - Semantic Statuses: Emerald for `Released`/`Active` (`#16A34A`), Amber for `Pending`/`Disputed` (`#D97706`), Rose for Reverted/Errors (`#DC2626`)
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` / `DM Sans` with balanced headlines and clear font weights (600/700)
  - Prose & Form Controls: Clean readable sans (14px–15px)
  - Monospace Data & Figures: `font-mono tabular-nums` for all addresses, hashes, gas metrics, block numbers, and ETH amounts to prevent visual jitter
- **Interactive Feedback & Motion**: Sub-200ms transitions, clear pending spinners on buttons during mining, immediate receipt modals, and expandable decoded logs.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pull-Over-Push Withdrawal Model**:
  - *Chosen Approach*: Approving a milestone or resolving a dispute does NOT send ETH directly via `transfer()` / `call()`. Instead, it increments the beneficiary's recorded balance in `withdrawable[account]`. Beneficiaries call `withdraw()` separately.
  - *Why*: Eliminates denial-of-service (DoS) and reentrancy vectors where a recipient's fallback function rejects an incoming transfer, bricking milestone settlement for everyone else.
  - *Alternatives Considered*: Direct push transfers were rejected because they violate the Checks-Effects-Interactions pattern and make multi-party settlements vulnerable to griefing.

- **Decision 2: Dual-Mode Execution Architecture**:
  - *Chosen Approach*: The dApp includes both the full Hardhat repository files (ready for terminal testing `npx hardhat test`) AND an embedded deterministic in-browser EVM engine implementing the exact Solidity bytecode logic and ABI.
  - *Why*: In an academic presentation or AI Studio preview, having the applet fully interactive out-of-the-box guarantees a smooth 5-minute live demo without relying on a separate terminal process, while still providing the exact Hardhat test suite for grading.
  - *Alternatives Considered*: Requiring an external `localhost:8545` RPC only was considered, but in web-hosted preview environments, browser mixed-content and cross-origin blocking of `http://localhost:8545` can break the demo. The hybrid mode allows switching between In-Browser Local Node and External RPC.

- **Decision 3: Basis Points Dispute Split with Remainder Protection**:
  - *Chosen Approach*: Dispute resolution uses basis points ($10,000 \text{ bps} = 100\%$). The Freelancer share is calculated as $\lfloor \text{amount} \times \text{shareBps} / 10000 \rfloor$, and Client refund is computed as $\text{amount} - \text{freelancerShare}$.
  - *Why*: Prevents any wei leakage due to integer division rounding, strictly preserving the zero-loss invariant.
  - *Alternatives Considered*: Storing float percentages was rejected as Solidity does not support floating-point arithmetic.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FREELANCE MILESTONE ESCROW DAPP                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│        Presentation Layer       │   │   Academic & Submission Center   │
│  • Global Top Bar & Account Sw. │   │  • Solidity Source Viewer        │
│  • Agreement Creation Form      │   │  • Hardhat Test Suite & Results  │
│  • Agreement Detail & Timelines │   │  • Security Threat Model Matrix  │
│  • Milestone State Machine UIs  │   │  • 5–8 Min Demo Script Guide     │
│  • Dispute & Arbitrator Split   │   │  • Full Repository ZIP Export    │
│  • Real-Time Tx Inspector       │   └──────────────────────────────────┘
└──────────────────┬──────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│           Contract Service & EVM Simulation Engine (ethers.js v6)      │
│  • Dispatches transactions with genuine Account signers (0–3)          │
│  • Computes Keccak-256 Tx hashes, Block mining, & Gas accounting       │
│  • Strict Solidity state machine transitions & require() validations   │
│  • Pull-over-push withdrawable balances & ReentrancyGuard protections  │
│  • Emits & decodes ABI events with exact indexed parameters            │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌────────────────┐
│ EscrowFactory │     │FreelanceEscrow │
│  (Solidity)   │     │  (Solidity)    │
└───────────────┘     └────────────────┘
```

#### Smart Contract Entities & State Model

```solidity
enum AgreementState { Unfunded, Active, Completed, Cancelled }
enum MilestoneState { Pending, Submitted, Released, Disputed, Resolved, Refunded }

struct Milestone {
    string title;
    uint256 amount;
    uint256 deadline;
    MilestoneState state;
    string submissionNote;
    uint256 freelancerShare;
    uint256 clientRefund;
}
```

#### Invariant Verification Formula
The contract and test suite verify the fundamental invariant after every state-changing call:
$$\text{address(this).balance} = \text{totalReserved} + \sum_{\forall u} \text{withdrawable}[u]$$

#### Milestone State Transitions
- $\text{Pending} \xrightarrow{\text{submitMilestone (Freelancer only, } t \le \text{deadline)}} \text{Submitted}$
- $\text{Pending} \xrightarrow{\text{refundMilestone (Client only, unstarted)}} \text{Refunded}$
- $\text{Submitted} \xrightarrow{\text{approveMilestone (Client only)}} \text{Released}$
- $\text{Submitted} \xrightarrow{\text{raiseDispute (Client or Freelancer)}} \text{Disputed}$
- $\text{Disputed} \xrightarrow{\text{resolveDispute (Arbitrator only, 0-10000 bps)}} \text{Resolved}$

#### Staged Delivery Roadmap
- **Stage 1 (Contracts & Specifications)**: Implement `FreelanceEscrow.sol` and `EscrowFactory.sol` with full OpenZeppelin reentrancy protections, events, view functions, and checked arithmetic.
- **Stage 2 (Automated Test Suite & Hardhat Config)**: Write comprehensive test specs (`FreelanceEscrow.test.ts`, `AccountingInvariant.test.ts`, `DisputesAndRefunds.test.ts`, `AccessControl.test.ts`) covering all positive, boundary, and revert conditions.
- **Stage 3 (Core Service & Provider Engine)**: Setup typed contract interfaces, ethers.js v6 integration, and account signer management.
- **Stage 4 (UI Views & Role Actions)**: Implement Header, Dashboard, Agreement Creator, Milestone Timeline, Role-specific modals, and Arbitrator percentage slider.
- **Stage 5 (Transaction Inspector & Academic Demo Hub)**: Build the full Transaction Inspector, live event decoding, demo script walkthrough, threat model, and source code viewer.
- **Stage 6 (Verification & Build Check)**: Verify compilation, zero console warnings, and end-to-end demo execution.
