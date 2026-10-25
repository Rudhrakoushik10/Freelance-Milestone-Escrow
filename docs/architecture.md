# System Architecture — Freelance Milestone Escrow

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Client (React + Vite)                │
│                                                                 │
│  [Pre-Sign In Menu]                                             │
│    • How It Works       • Features           • Security         │
│                                                                 │
│  [Single-Role Enforced Navigation]                              │
│    • Client:     Dashboard | My Projects | Create | Tx | Wallet │
│    • Freelancer: Dashboard | My Projects | Submissions |        │
│                  Earnings | Transactions | Wallet               │
│    • Arbitrator: Dashboard | Active Disputes | Tx | Wallet      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Ethers.js v6 JSON-RPC
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVM / Hardhat Node (Chain ID: 31337)               │
│                                                                 │
│  Account 0 (Client):     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
│  Account 1 (Freelancer): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
│  Account 2 (Arbitrator): 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
│  Account 3 (Freelancer): 0x90F79bf6EB2c4f870365E785982E1f101E93b906
│  Account 4 (Client):     0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
└─────────────────┬───────────────────────────────┬───────────────┘
                  │ Deploys                       │ Interacts
                  ▼                               ▼
       ┌────────────────────┐          ┌────────────────────┐
       │  EscrowFactory.sol │          │FreelanceEscrow.sol │
       └────────────────────┘          └────────────────────┘
```

---

## 2. Strict Single-Role Architecture

The protocol enforces a **Single-Role Architecture** where each wallet address is permanently assigned to exactly one functional role:

| Role | Permitted Actions | Prohibited Actions |
| :--- | :--- | :--- |
| **Client** | Create agreements, deposit escrow funds, approve milestone deliverables, raise disputes | Cannot submit deliverables, cannot arbitrate disputes |
| **Freelancer** | Accept project agreements, submit milestone work proofs, withdraw earned credits | Cannot create client agreements, cannot arbitrate disputes |
| **Arbitrator** | Review contested milestone submissions, execute split settlements | Cannot create client agreements, cannot submit work deliverables |

### Rationale
In decentralized escrow protocols, allowing the same account to execute both commissioner and contractor actions on the same or related agreements creates severe privilege escalation risks, self-funding manipulation vectors, and audit confusion. Enforcing single-role segregation guarantees clean access boundaries and verifiable event auditing.

---

## 3. On-Chain Contracts

### 3.1 `EscrowFactory.sol`
- Deploys new `FreelanceEscrow` contracts using the factory pattern.
- Validates that `client`, `freelancer`, and `arbitrator` addresses are strictly non-zero and pairwise distinct.
- Emits the indexing event:
  ```solidity
  event AgreementCreated(
      address indexed escrowAddress,
      address indexed client,
      address indexed freelancer,
      address arbitrator,
      string title,
      uint256 totalAmount,
      uint256 milestoneCount,
      uint256 timestamp
  );
  ```
- Holds zero protocol funds, eliminating systemic honey-pot vulnerabilities.

### 3.2 `FreelanceEscrow.sol`
- Governs individual contract lifecycles across defined states (`Unfunded`, `Active`, `Completed`, `Cancelled`).
- Tracks per-milestone state transitions (`Pending` -> `Submitted` -> `Released` / `Disputed` -> `Resolved`).
- Pull-over-push withdrawal pattern:
  ```solidity
  mapping(address => uint256) public withdrawable;
  ```
- Reentrancy protection via `nonReentrant` on all external value transfers.

---

## 4. Formal Financial Accounting Invariant

At every block and after every state mutation, the following invariant holds true without exception:

$$\text{address(this).balance} == \text{totalReserved} + \sum_{u} \text{withdrawable}[u]$$

### Dispute Percentage Allocation
To eliminate fractional wei leakage during dispute settlements:

$$\text{freelancerShare} = \left\lfloor \frac{\text{amount} \times \text{basisPoints}}{10000} \right\rfloor$$

$$\text{clientRefund} = \text{amount} - \text{freelancerShare}$$

By deriving `clientRefund` as the exact arithmetic difference rather than a separate division, zero wei is ever trapped or lost.
