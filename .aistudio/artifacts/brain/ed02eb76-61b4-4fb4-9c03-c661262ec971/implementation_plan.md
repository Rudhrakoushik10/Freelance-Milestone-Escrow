# Implementation Plan - Alignment with University Tech Stack & Local Hardhat / MetaMask Support

Align the platform with the exact university project tech stack specification, rename the contract to `FreelanceMilestoneEscrow.sol`, add Hardhat Ignition deployment modules, and support MetaMask + local Hardhat RPC (`http://127.0.0.1:8545`) with web preview fallback.

## Proposed Changes

### 1. Smart Contract & Hardhat Alignment
- Rename `contracts/FreelanceEscrow.sol` to `contracts/FreelanceMilestoneEscrow.sol` (contract name `FreelanceMilestoneEscrow`).
- Update `contracts/EscrowFactory.sol` to instantiate `FreelanceMilestoneEscrow` contracts.
- Update Hardhat compilation & deploy scripts in `scripts/deploy.cjs`.
- Add Hardhat Ignition deployment module in `ignition/modules/FreelanceMilestoneEscrow.cjs` supporting `npx hardhat ignition deploy ignition/modules/FreelanceMilestoneEscrow.cjs --network localhost`.
- Update all 5 test files in `test/*.test.cjs` to test `FreelanceMilestoneEscrow` and ensure 100% pass rate.

### 2. Ethers.js v6, MetaMask & Local Hardhat Node Integration
- Upgrade `src/services/contractService.ts` to support 3 connection modes:
  1. **MetaMask Direct Integration:** Detect `window.ethereum`, request `eth_requestAccounts`, switch/add Hardhat Localhost network (Chain ID 31337), and sign real transactions via `BrowserProvider`.
  2. **Local Hardhat RPC Node:** Connect via `ethers.JsonRpcProvider("http://127.0.0.1:8545")` when running `npx hardhat node`.
  3. **In-Browser EVM Simulation Fallback:** Provide instant out-of-the-box reactivity when no external node is active.
- Update `ConnectWalletModal.tsx` and navbar to display connection status (*"MetaMask Connected"*, *"Hardhat Local Node"*, or *"Simulation Mode"*), with 1-click account switching and MetaMask wallet import guides.

### 3. Local University Presentation Guide
- Create a clear `LOCAL_DEMO_GUIDE.md` detailing step-by-step terminal commands for running:
  1. `npx hardhat node` (Local Ethereum Blockchain)
  2. `npx hardhat ignition deploy ignition/modules/FreelanceMilestoneEscrow.cjs --network localhost`
  3. Importing Hardhat private keys into MetaMask
  4. `npm run dev` (Frontend Server)

---

## Verification Plan

### Automated Tests
1. Run `npx hardhat test` to ensure all `FreelanceMilestoneEscrow` tests pass cleanly.
2. Run `compile_applet` and `lint_applet` to confirm zero TypeScript and Vite build issues.

### Manual Verification
1. Verify MetaMask connection modal and account switching.
2. Verify Hardhat node connectivity on `http://127.0.0.1:8545`.
3. Test milestone creation, deliverable submission, client approval, and pull-over-push withdrawals.
