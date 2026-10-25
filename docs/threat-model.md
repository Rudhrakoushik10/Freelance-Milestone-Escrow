# Security Specification & Threat Model

## 1. Trust Assumptions & Access Boundaries

- **Client**: Authorized to create agreements and fund total milestone commitments. Can approve deliverables, raise disputes, and claim refunds on unstarted cancelled phases. Cannot unilaterally drain submitted or released milestones.
- **Freelancer**: Authorized to accept assignments, submit deliverables, raise disputes, and withdraw credited earnings. Cannot approve own work or withdraw beyond credited balance.
- **Arbitrator**: Authorized strictly to resolve contested milestones. Cannot reassign roles, create unbacked payments, or touch non-disputed milestone funds.
- **Unauthorized Callers / Attackers**: Any arbitrary external address. Strictly blocked by role-based modifiers (`onlyClient`, `onlyFreelancer`, `onlyArbitrator`).

---

## 2. Threat Analysis & Mitigations

| Threat | Attack Vector | Smart Contract Mitigation |
| :--- | :--- | :--- |
| **Reentrancy Attacks** | Malicious contract invokes `withdraw()` recursively during ETH transfer | `nonReentrant` modifier combined with Checks-Effects-Interactions (credit mapping is set to 0 before the `.call{value: amount}("")` transfer). |
| **Denial of Service (DoS)** | Malicious client or freelancer refuses incoming ETH to halt milestone progression | Pull-over-push architecture: approvals update internal balances (`withdrawable[user]`); external ETH transfers only occur when explicitly pulled by the beneficiary. |
| **Fractional Wei Leakage** | Division remainders during dispute splits leave dust trapped in the contract | Derived exact subtraction: `clientRefund = amount - freelancerShare`. Zero wei remains unallocated. |
| **Unauthorized State Mutation** | Attacker calls `approveMilestone()`, `fundAgreement()`, or `resolveDispute()` | Modifiers enforce caller validation on-chain (`require(msg.sender == client)`, etc.). |
| **State Desynchronization** | Attempting to submit after deadline or approve an unsubmitted phase | Strict enum finite state machine (`m.state == MilestoneState.Submitted`). Invalid transitions immediately revert. |
| **Underfunding & Overfunding** | Calling funding method with incorrect ETH amount | Exact balance enforcement: `require(msg.value == totalRequired)`. |
| **Cross-Role Pollution** | Single account attempting to act simultaneously as Client and Freelancer on same contract | Construction validation: `require(client != freelancer && client != arbitrator && freelancer != arbitrator)`. |
