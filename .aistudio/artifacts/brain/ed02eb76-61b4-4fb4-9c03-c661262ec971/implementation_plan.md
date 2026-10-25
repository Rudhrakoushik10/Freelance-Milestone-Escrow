# Role-Based Milestone Action Visibility & Access Enforcement

Enforce strict role-based UI controls and contract guards so each connected account (`Client — Alex`, `Freelancer — Stark`, `Arbitrator — Mark`) only sees the action buttons permitted for its specific role, while displaying clear waiting status badges when a milestone or agreement awaits another participant's action.

## User Review & Critical Decisions

> [!IMPORTANT]
> Confirmed decisions from your answers are incorporated below and govern both the UI action controls and smart contract validation.

- **Confirmed Decision 1 (Dispute Trigger Authority)**: Only the **Client (Alex)** can trigger **Approve & Credit Freelancer** or **Raise Dispute** on a submitted milestone.
- **Confirmed Decision 2 (Non-Active Role UX)**: When an account views an agreement or milestone waiting on another role, the other roles' action buttons are completely hidden and replaced with a clear **waiting status badge** indicating which participant is next in the workflow.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates cross-role button exposure in the agreement detail screen so that:
  - **Client (Alex)** exclusively sees **Deposit Exact Funding** (when `Unfunded`) and **Approve & Credit Freelancer** / **Raise Dispute** (when a milestone is `Submitted`).
  - **Freelancer (Stark)** exclusively sees **Submit Work** (when a milestone is `Pending` and the agreement is `Active`).
  - **Arbitrator (Mark)** exclusively sees **Resolve Dispute** allocation controls (when a milestone is `Disputed`).
- **Target Audience / Persona**: Clients, freelancers, and arbitrators testing or operating multi-milestone escrow agreements with MetaMask / Hardhat accounts.
- **Key Value**: Prevents confusing or unauthorized action buttons from appearing on the wrong account and aligns the visual interface 1:1 with the smart contract's `onlyClient`, `onlyFreelancer`, and `onlyArbitrator` access modifiers.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Unfunded Agreement Banner**:
     - **Connected as Client (Alex)**: Displays the **Deposit Exact Funding** action button.
     - **Connected as Freelancer (Stark) / Arbitrator (Mark) / Observer**: Hides the deposit button and shows an amber waiting badge: `Awaiting Client (Alex) to deposit exact escrow funding`.
  2. **Pending Milestone (`Active` Agreement)**:
     - **Connected as Freelancer (Stark)**: Displays the **Submit Work** button and submission drawer.
     - **Connected as Client (Alex) / Arbitrator (Mark)**: Hides the submit button and renders a slate/blue status badge: `Awaiting Freelancer (Stark) Submission`.
  3. **Submitted Milestone (`Active` Agreement)**:
     - **Connected as Client (Alex)**: Displays **Approve & Credit Freelancer** and **Raise Dispute** buttons.
     - **Connected as Freelancer (Stark) / Arbitrator (Mark)**: Hides both buttons and renders an indigo waiting badge: `Awaiting Client (Alex) Review & Approval`.
  4. **Disputed Milestone (`Active` Agreement)**:
     - **Connected as Arbitrator (Mark)**: Displays the **Resolve Dispute** basis-point split controls and confirmation button.
     - **Connected as Client (Alex) / Freelancer (Stark)**: Hides the arbitration controls and renders a rose waiting badge: `Awaiting Arbitrator (Mark) Ruling`.
- **Visual Identity & Theme**:
  - Retains the existing dark slate financial ledger aesthetic (`bg-slate-900`, `border-slate-800`, monospace address/ETH readouts) with semantic status badges (`amber` for funding wait, `sky/indigo` for work/review wait, `rose` for arbitration wait, `emerald` for completed/released states).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Role Hiding + Waiting Status Badges over Disabled Buttons**
  - *Chosen Approach*: Completely hide buttons belonging to other roles and render a contextual waiting status pill in the milestone action bar.
  - *Why*: Keeps each participant's dashboard uncluttered and makes it unmistakable whose turn it is in the escrow state machine.
- **Decision 2: Align Contract & Service Layer `raiseDispute` to Client-Only**
  - *Chosen Approach*: Update `raiseDispute` in the Solidity contract and service validation from `onlyParticipant` to `onlyClient` so the smart contract and frontend enforce the exact same rule.
  - *Why*: Guarantees defense-in-depth so even direct contract calls respect the Client-only review/dispute authority.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Connected Account Role Detection                     │
│  isClient     = (connectedAccount == agreement.client)                  │
│  isFreelancer = (connectedAccount == agreement.freelancer)              │
│  isArbitrator = (connectedAccount == agreement.arbitrator)              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────┐     ┌─────────────────────┐
│  Unfunded State   │     │   Milestone Row   │     │ Pull-Over-Push Pool │
├───────────────────┤     ├───────────────────┤     ├─────────────────────┤
│ • If isClient:    │     │ • Pending:        │     │ • Shows Withdraw    │
│   [Deposit Funds] │     │   isFreelancer ?  │     │   button only when  │
│ • Else:           │     │   [Submit Work] : │     │   connected user's  │
│   Badge: Awaiting │     │   Badge: Awaiting │     │   withdrawable > 0  │
│   Client Funding  │     │   Freelancer      │     │                     │
│                   │     │ • Submitted:      │     │                     │
│                   │     │   isClient ?      │     │                     │
│                   │     │   [Approve/Dispute│     │                     │
│                   │     │   : Badge:        │     │                     │
│                   │     │   Awaiting Client │     │                     │
│                   │     │ • Disputed:       │     │                     │
│                   │     │   isArbitrator ?  │     │                     │
│                   │     │   [Resolve Split] │     │                     │
│                   │     │   : Badge:        │     │                     │
│                   │     │   Awaiting Arb.   │     │                     │
└───────────────────┘     └───────────────────┘     └─────────────────────┘
```

- **Interactive Component & State Mapping**:
  - **Role Resolution**: Evaluates case-insensitive address equality between `connectedAccount` and `agreement.client`, `agreement.freelancer`, and `agreement.arbitrator`.
  - **Conditional Action Bar**: Each milestone card checks `(milestone.state, agreement.agreementState, isClient, isFreelancer, isArbitrator)` before rendering any interactive `<button>` or drawer trigger.
  - **Contract & Service Enforcement**: Updates `raiseDispute` modifier to `onlyClient` and ensures service-layer validation checks caller == `agreement.client`.
