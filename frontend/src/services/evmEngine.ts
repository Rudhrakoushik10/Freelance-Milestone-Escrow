import { ethers } from 'ethers';
import {
  Agreement,
  DecodedEvent,
  HardhatAccount,
  Milestone,
  NotificationRecord,
  TransactionRecord,
} from '../types/escrow';

export const HARDHAT_ACCOUNTS: HardhatAccount[] = [
  {
    id: 'account-0',
    name: 'Alex Rivera',
    username: 'alex.eth',
    role: 'client',
    roleLabel: 'Client',
    roleDescription: 'Dedicated Client: Commissions contracts, funds escrow, and releases payments.',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balance: '9998.70',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    avatarSeed: 'alex',
  },
  {
    id: 'account-1',
    name: 'Elena Vance',
    username: 'elena.eth',
    role: 'freelancer',
    roleLabel: 'Freelancer',
    roleDescription: 'Dedicated Freelancer: Submits deliverables, receives milestone approvals, withdraws earnings.',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    balance: '10000.00',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    avatarSeed: 'elena',
  },
  {
    id: 'account-2',
    name: 'Marcus Thorne',
    username: 'marcus.eth',
    role: 'arbitrator',
    roleLabel: 'Arbitrator',
    roleDescription: 'Dedicated Arbitrator: Impartial third-party mediator for resolving milestone disputes.',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    balance: '10000.00',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    avatarSeed: 'marcus',
  },
  {
    id: 'account-3',
    name: 'Devon Reed',
    username: 'devon.eth',
    role: 'freelancer',
    roleLabel: 'Freelancer',
    roleDescription: 'Dedicated Freelancer: Full-stack Web3 developer specialized in smart contracts & dApps.',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    balance: '10000.00',
    privateKey: '0x7c852118294e51e653712a4305880ff366367c574abbc0f4d730ba99efad08bc',
    avatarSeed: 'devon',
  },
  {
    id: 'account-4',
    name: 'Sophia Chen',
    username: 'sophia.eth',
    role: 'client',
    roleLabel: 'Client',
    roleDescription: 'Dedicated Client: Product lead commissioning high-value decentralized infrastructure.',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    balance: '10000.00',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    avatarSeed: 'sophia',
  },
];

export const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

class EVMEngine {
  private accounts: HardhatAccount[] = [];
  private activeAccount: HardhatAccount = HARDHAT_ACCOUNTS[0];
  private agreements: Map<string, Agreement> = new Map();
  private contractBalances: Map<string, bigint> = new Map(); // address => balance in wei
  private withdrawableCredits: Map<string, Map<string, bigint>> = new Map(); // contractAddress => (userAddress => wei)
  private transactions: TransactionRecord[] = [];
  private notifications: NotificationRecord[] = [];
  private latestToast: NotificationRecord | null = null;
  private currentBlock: number = 1042;
  private listeners: Set<() => void> = new Set();
  private storageKey = 'freelance_escrow_evm_state_v5';

  constructor() {
    this.init();
  }

  private init() {
    this.accounts = JSON.parse(JSON.stringify(HARDHAT_ACCOUNTS));
    this.activeAccount = this.accounts[0];

    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.currentBlock = parsed.currentBlock || 1042;
        this.transactions = parsed.transactions || [];
        this.notifications = parsed.notifications || [];
        if (parsed.activeAccountId) {
          const found = this.accounts.find((a) => a.id === parsed.activeAccountId);
          if (found) this.activeAccount = found;
        }
        if (parsed.agreements && parsed.agreements.length > 0) {
          for (const item of parsed.agreements) {
            this.agreements.set(item.address, {
              ...item,
              totalRequiredWei: BigInt(item.totalRequiredWei || '0'),
              totalReservedWei: BigInt(item.totalReservedWei || '0'),
              milestones: item.milestones.map((m: any) => ({
                ...m,
                amountWei: BigInt(m.amountWei || '0'),
              })),
            });
            this.contractBalances.set(item.address, BigInt(item.contractBalanceWei || '0'));

            const creditMap = new Map<string, bigint>();
            if (item.withdrawable) {
              for (const [addr, amt] of Object.entries(item.withdrawable)) {
                creditMap.set(addr.toLowerCase(), BigInt(amt as string));
              }
            }
            this.withdrawableCredits.set(item.address, creditMap);
          }
          return;
        }
      } catch (e) {
        console.warn('Failed to load EVM state from localStorage, seeding fresh state');
      }
    }

    this.seedDefaultShowcase();
  }

  public resetState() {
    localStorage.removeItem(this.storageKey);
    this.agreements.clear();
    this.contractBalances.clear();
    this.withdrawableCredits.clear();
    this.transactions = [];
    this.notifications = [];
    this.latestToast = null;
    this.currentBlock = 1042;
    this.accounts = JSON.parse(JSON.stringify(HARDHAT_ACCOUNTS));
    this.activeAccount = this.accounts[0];
    this.seedDefaultShowcase();
    this.notify();
  }

  private seedDefaultShowcase() {
    const escrowAddr = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const now = Math.floor(Date.now() / 1000);

    const m1Amount = ethers.parseEther('0.30');
    const m2Amount = ethers.parseEther('0.50');
    const m3Amount = ethers.parseEther('0.20');
    const totalRequired = m1Amount + m2Amount + m3Amount; // 1.0 ETH

    const milestones: Milestone[] = [
      {
        index: 0,
        title: 'Milestone 1: UI Prototype & Figma Design System',
        amount: '0.30',
        amountWei: m1Amount,
        deadline: now + 86400 * 7,
        state: 'Pending',
        submissionNote: '',
        freelancerShare: '0.00',
        clientRefund: '0.00',
      },
      {
        index: 1,
        title: 'Milestone 2: Solidity Escrow & Hardhat Test Suite',
        amount: '0.50',
        amountWei: m2Amount,
        deadline: now + 86400 * 14,
        state: 'Pending',
        submissionNote: '',
        freelancerShare: '0.00',
        clientRefund: '0.00',
      },
      {
        index: 2,
        title: 'Milestone 3: Final Delivery & Verification Presentation',
        amount: '0.20',
        amountWei: m3Amount,
        deadline: now + 86400 * 21,
        state: 'Pending',
        submissionNote: '',
        freelancerShare: '0.00',
        clientRefund: '0.00',
      },
    ];

    // --- Agreement 1: Account 0 is Client, Account 1 is Freelancer ---
    const agreement1: Agreement = {
      address: escrowAddr,
      title: 'Decentralized Milestone Escrow dApp Agreement',
      client: HARDHAT_ACCOUNTS[0].address,
      freelancer: HARDHAT_ACCOUNTS[1].address,
      arbitrator: HARDHAT_ACCOUNTS[2].address,
      agreementState: 'Unfunded',
      totalRequired: '1.00',
      totalRequiredWei: totalRequired,
      totalReserved: '0.00',
      totalReservedWei: 0n,
      totalCredited: '0.00',
      totalWithdrawn: '0.00',
      createdAt: now - 3600,
      milestones,
    };

    this.agreements.set(escrowAddr, agreement1);
    this.contractBalances.set(escrowAddr, 0n);

    const credits1 = new Map<string, bigint>();
    credits1.set(HARDHAT_ACCOUNTS[0].address.toLowerCase(), 0n);
    credits1.set(HARDHAT_ACCOUNTS[1].address.toLowerCase(), 0n);
    this.withdrawableCredits.set(escrowAddr, credits1);

    // --- Agreement 2: Alex Rivera is Client, Elena Vance is Freelancer ---
    const escrowAddr2 = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';
    const auditM1 = ethers.parseEther('0.30');
    const auditM2 = ethers.parseEther('0.30');
    const auditTotal = auditM1 + auditM2; // 0.60 ETH

    const agreement2: Agreement = {
      address: escrowAddr2,
      title: 'Solidity Escrow Security Audit & Verification',
      client: HARDHAT_ACCOUNTS[0].address, // Alex is Client
      freelancer: HARDHAT_ACCOUNTS[1].address, // Elena is Freelancer
      arbitrator: HARDHAT_ACCOUNTS[2].address,
      agreementState: 'Active',
      totalRequired: '0.60',
      totalRequiredWei: auditTotal,
      totalReserved: '0.30',
      totalReservedWei: auditM2,
      totalCredited: '0.30',
      totalWithdrawn: '0.00',
      createdAt: now - 7200,
      milestones: [
        {
          index: 0,
          title: 'Milestone 1: Invariant Accounting Test Suite & Fuzzing',
          amount: '0.30',
          amountWei: auditM1,
          deadline: now + 86400 * 5,
          state: 'Released',
          submissionNote: 'Invariant test suite completed with 100% assertions passing.',
          freelancerShare: '0.30',
          clientRefund: '0.00',
        },
        {
          index: 1,
          title: 'Milestone 2: Reentrancy Threat Modeling & Formal Review',
          amount: '0.30',
          amountWei: auditM2,
          deadline: now + 86400 * 12,
          state: 'Pending',
          submissionNote: '',
          freelancerShare: '0.00',
          clientRefund: '0.00',
        },
      ],
    };

    this.agreements.set(escrowAddr2, agreement2);
    this.contractBalances.set(escrowAddr2, auditTotal); // funded 0.60 ETH

    const credits2 = new Map<string, bigint>();
    credits2.set(HARDHAT_ACCOUNTS[0].address.toLowerCase(), 0n);
    credits2.set(HARDHAT_ACCOUNTS[1].address.toLowerCase(), auditM1); // Elena (Freelancer) has 0.30 ETH withdrawable!
    this.withdrawableCredits.set(escrowAddr2, credits2);

    // --- Agreement 3: Sophia Chen (Client) commissions Devon Reed (Freelancer), Marcus Thorne (Arbitrator) ---
    const escrowAddr3 = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
    const bridgeM1 = ethers.parseEther('0.40');
    const bridgeM2 = ethers.parseEther('0.50');
    const bridgeM3 = ethers.parseEther('0.30');
    const bridgeTotal = bridgeM1 + bridgeM2 + bridgeM3; // 1.20 ETH

    const agreement3: Agreement = {
      address: escrowAddr3,
      title: 'Web3 Cross-Chain Relayer & Subgraph Service',
      client: HARDHAT_ACCOUNTS[4].address, // Sophia Chen (Client)
      freelancer: HARDHAT_ACCOUNTS[3].address, // Devon Reed (Freelancer)
      arbitrator: HARDHAT_ACCOUNTS[2].address, // Marcus Thorne (Arbitrator)
      agreementState: 'Active',
      totalRequired: '1.20',
      totalRequiredWei: bridgeTotal,
      totalReserved: '0.80',
      totalReservedWei: bridgeM2 + bridgeM3,
      totalCredited: '0.40',
      totalWithdrawn: '0.00',
      createdAt: now - 14400,
      milestones: [
        {
          index: 0,
          title: 'Milestone 1: Subgraph Indexing & GraphQL API Schema',
          amount: '0.40',
          amountWei: bridgeM1,
          deadline: now + 86400 * 3,
          state: 'Released',
          submissionNote: 'Schema indexed 45,000 blocks with zero lagging.',
          freelancerShare: '0.40',
          clientRefund: '0.00',
        },
        {
          index: 1,
          title: 'Milestone 2: Relayer UI & Invariant Assertions',
          amount: '0.50',
          amountWei: bridgeM2,
          deadline: now + 86400 * 10,
          state: 'Disputed',
          submissionNote: 'Frontend delivered, but client requested arbitration over invariant assertions.',
          freelancerShare: '0.00',
          clientRefund: '0.00',
        },
        {
          index: 2,
          title: 'Milestone 3: Production Mainnet Deployment & Handover',
          amount: '0.30',
          amountWei: bridgeM3,
          deadline: now + 86400 * 18,
          state: 'Pending',
          submissionNote: '',
          freelancerShare: '0.00',
          clientRefund: '0.00',
        },
      ],
    };

    this.agreements.set(escrowAddr3, agreement3);
    this.contractBalances.set(escrowAddr3, bridgeTotal);

    const credits3 = new Map<string, bigint>();
    credits3.set(HARDHAT_ACCOUNTS[4].address.toLowerCase(), 0n);
    credits3.set(HARDHAT_ACCOUNTS[3].address.toLowerCase(), bridgeM1); // Devon has 0.40 ETH withdrawable
    this.withdrawableCredits.set(escrowAddr3, credits3);

    // Initial deployment tx
    const deployTx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: HARDHAT_ACCOUNTS[0].address,
      to: FACTORY_ADDRESS,
      action: 'createAgreement',
      value: '0.00 ETH',
      status: 'success',
      gasUsed: 184520,
      timestamp: now - 3600,
      contractAddress: escrowAddr,
      events: [
        {
          name: 'AgreementCreated',
          signature:
            'AgreementCreated(address,address,address,address,string,uint256,uint256,uint256)',
          args: {
            escrowAddress: escrowAddr,
            client: HARDHAT_ACCOUNTS[0].address,
            freelancer: HARDHAT_ACCOUNTS[1].address,
            arbitrator: HARDHAT_ACCOUNTS[2].address,
            title: agreement1.title,
            totalAmount: '1000000000000000000 (1.00 ETH)',
            milestoneCount: 3,
            timestamp: now - 3600,
          },
        },
      ],
    };
    this.transactions.unshift(deployTx);

    // Initial Seed Notifications for Real-Time Alert Demonstration
    this.notifications = [
      {
        id: 'notif_seed_dispute',
        type: 'disputed',
        title: 'Milestone Dispute Escalated to Arbitrator',
        message: 'Milestone 2 (Relayer UI & Invariant Assertions) on "Web3 Cross-Chain Relayer" was disputed. Neutral Arbitrator Marcus Thorne assigned to review evidence.',
        timestamp: now - 900,
        read: false,
        contractAddress: escrowAddr3,
        milestoneIndex: 1,
        amountEth: '0.50',
        severity: 'warning',
      },
      {
        id: 'notif_seed_1',
        type: 'completed',
        title: 'Milestone Approved & Completed',
        message: 'Milestone 1 (Invariant Accounting Test Suite) on "Solidity Escrow Security Audit" was approved. 0.30 ETH released into withdrawable balance.',
        timestamp: now - 1800,
        read: false,
        contractAddress: escrowAddr2,
        milestoneIndex: 0,
        amountEth: '0.30',
        severity: 'success',
      },
      {
        id: 'notif_seed_2',
        type: 'funded',
        title: 'Escrow Agreement Funded',
        message: 'Agreement "Solidity Escrow Security Audit" was funded with 0.60 ETH by Client Alex Rivera. Milestone funds are locked in smart contract escrow.',
        timestamp: now - 7200,
        read: true,
        contractAddress: escrowAddr2,
        amountEth: '0.60',
        severity: 'success',
      },
      {
        id: 'notif_seed_3',
        type: 'created',
        title: 'New Milestone Agreement Created',
        message: 'Agreement "Decentralized Milestone Escrow dApp Agreement" was created with 3 milestones totaling 1.00 ETH.',
        timestamp: now - 3600,
        read: true,
        contractAddress: escrowAddr,
        amountEth: '1.00',
        severity: 'info',
      },
    ];

    this.persist();
  }

  private persist() {
    const list: any[] = [];
    for (const [addr, agr] of this.agreements.entries()) {
      const balance = this.contractBalances.get(addr) || 0n;
      const creditMap = this.withdrawableCredits.get(addr);
      const creditsObj: Record<string, string> = {};
      if (creditMap) {
        for (const [user, val] of creditMap.entries()) {
          creditsObj[user] = val.toString();
        }
      }
      list.push({
        ...agr,
        totalRequiredWei: agr.totalRequiredWei.toString(),
        totalReservedWei: agr.totalReservedWei.toString(),
        contractBalanceWei: balance.toString(),
        withdrawable: creditsObj,
        milestones: agr.milestones.map((m) => ({
          ...m,
          amountWei: m.amountWei.toString(),
        })),
      });
    }

    const payload = {
      currentBlock: this.currentBlock,
      activeAccountId: this.activeAccount.id,
      transactions: this.transactions,
      notifications: this.notifications,
      agreements: list,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  private notify() {
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // --- Notification Methods ---
  public getNotifications(userAddress?: string): NotificationRecord[] {
    if (!userAddress) return this.notifications;
    const lower = userAddress.toLowerCase();
    return this.notifications.filter(
      (n) => !n.recipientAddress || n.recipientAddress.toLowerCase() === lower
    );
  }

  public getUnreadCount(userAddress?: string): number {
    return this.getNotifications(userAddress).filter((n) => !n.read).length;
  }

  public markAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  public markAllAsRead(userAddress?: string) {
    const notifs = this.getNotifications(userAddress);
    for (const n of notifs) {
      n.read = true;
    }
    this.notify();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  public getLatestToast(): NotificationRecord | null {
    return this.latestToast;
  }

  public clearLatestToast() {
    this.latestToast = null;
    this.notify();
  }

  private addNotification(notif: Omit<NotificationRecord, 'id' | 'timestamp' | 'read'>) {
    const record: NotificationRecord = {
      ...notif,
      id: 'notif_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      timestamp: Math.floor(Date.now() / 1000),
      read: false,
    };
    this.notifications.unshift(record);
    this.latestToast = record;
  }

  // --- Getters ---
  public getAccounts(): HardhatAccount[] {
    return this.accounts;
  }

  public getActiveAccount(): HardhatAccount {
    return this.activeAccount;
  }

  public setActiveAccount(id: string) {
    const acc = this.accounts.find((a) => a.id === id);
    if (acc) {
      this.activeAccount = acc;
      this.notify();
    }
  }

  public getAgreements(): Agreement[] {
    return Array.from(this.agreements.values());
  }

  public getAgreement(address: string): Agreement | undefined {
    return this.agreements.get(address);
  }

  public getContractBalance(address: string): { eth: string; wei: bigint } {
    const b = this.contractBalances.get(address) || 0n;
    return { eth: ethers.formatEther(b), wei: b };
  }

  public getWithdrawable(
    contractAddress: string,
    userAddress: string
  ): { eth: string; wei: bigint } {
    const credits = this.withdrawableCredits.get(contractAddress);
    const amt = credits?.get(userAddress.toLowerCase()) || 0n;
    return { eth: ethers.formatEther(amt), wei: amt };
  }

  public getTransactions(): TransactionRecord[] {
    return this.transactions;
  }

  public getCurrentBlock(): number {
    return this.currentBlock;
  }

  public verifyAccountingInvariant(contractAddress: string): {
    holds: boolean;
    balanceEth: string;
    totalReservedEth: string;
    totalWithdrawableEth: string;
    totalLiabilitiesEth: string;
  } {
    const agr = this.agreements.get(contractAddress);
    const balance = this.contractBalances.get(contractAddress) || 0n;
    if (!agr) {
      return {
        holds: true,
        balanceEth: '0',
        totalReservedEth: '0',
        totalWithdrawableEth: '0',
        totalLiabilitiesEth: '0',
      };
    }

    const credits = this.withdrawableCredits.get(contractAddress);
    let sumWithdrawable = 0n;
    if (credits) {
      for (const val of credits.values()) {
        sumWithdrawable += val;
      }
    }

    const liabilities = agr.totalReservedWei + sumWithdrawable;
    const holds = balance === liabilities;

    return {
      holds,
      balanceEth: ethers.formatEther(balance),
      totalReservedEth: ethers.formatEther(agr.totalReservedWei),
      totalWithdrawableEth: ethers.formatEther(sumWithdrawable),
      totalLiabilitiesEth: ethers.formatEther(liabilities),
    };
  }

  // --- Transactions & Mutations ---

  private generateTxHash(): string {
    const entropy = Math.random().toString() + Date.now().toString();
    return ethers.keccak256(ethers.toUtf8Bytes(entropy));
  }

  private generateContractAddress(): string {
    const entropy = 'contract_' + Math.random().toString() + Date.now().toString();
    return ethers.getAddress('0x' + ethers.keccak256(ethers.toUtf8Bytes(entropy)).substring(26));
  }

  private deductGas(account: HardhatAccount, gasUsed: number) {
    const gasFee = Number(ethers.formatEther(BigInt(gasUsed) * 20000000000n)); // 20 gwei
    const curr = parseFloat(account.balance);
    account.balance = Math.max(0, curr - gasFee).toFixed(4);
  }

  /**
   * Factory: createAgreement
   */
  public async createAgreement(params: {
    freelancer: string;
    arbitrator: string;
    title: string;
    milestoneTitles: string[];
    milestoneAmounts: string[]; // ETH
    milestoneDeadlinesDays: number[];
  }): Promise<{ receipt: TransactionRecord; agreementAddress: string }> {
    const sender = this.activeAccount;
    const now = Math.floor(Date.now() / 1000);

    // Validation matching FreelanceEscrow.sol constructor
    if (!ethers.isAddress(params.freelancer) || params.freelancer === ethers.ZeroAddress) {
      throw new Error('FreelanceEscrow: freelancer cannot be zero address');
    }
    if (!ethers.isAddress(params.arbitrator) || params.arbitrator === ethers.ZeroAddress) {
      throw new Error('FreelanceEscrow: arbitrator cannot be zero address');
    }
    if (sender.address.toLowerCase() === params.freelancer.toLowerCase()) {
      throw new Error('FreelanceEscrow: client and freelancer must differ');
    }
    if (sender.address.toLowerCase() === params.arbitrator.toLowerCase()) {
      throw new Error('FreelanceEscrow: client and arbitrator must differ');
    }
    if (params.freelancer.toLowerCase() === params.arbitrator.toLowerCase()) {
      throw new Error('FreelanceEscrow: freelancer and arbitrator must differ');
    }
    if (params.milestoneTitles.length === 0) {
      throw new Error('FreelanceEscrow: must have at least one milestone');
    }
    if (params.milestoneTitles.length > 10) {
      throw new Error('FreelanceEscrow: milestone count exceeds max 10');
    }

    const escrowAddr = this.generateContractAddress();
    let sumWei = 0n;
    const milestones: Milestone[] = [];

    for (let i = 0; i < params.milestoneTitles.length; i++) {
      const amtEth = params.milestoneAmounts[i];
      const amtWei = ethers.parseEther(amtEth || '0');
      if (amtWei <= 0n) {
        throw new Error('FreelanceEscrow: milestone amount must be > 0');
      }
      const deadline = now + params.milestoneDeadlinesDays[i] * 86400;

      milestones.push({
        index: i,
        title: params.milestoneTitles[i],
        amount: parseFloat(amtEth).toFixed(2),
        amountWei: amtWei,
        deadline,
        state: 'Pending',
        submissionNote: '',
        freelancerShare: '0.00',
        clientRefund: '0.00',
      });
      sumWei += amtWei;
    }

    const agreement: Agreement = {
      address: escrowAddr,
      title: params.title.trim() || 'Freelance Agreement',
      client: sender.address,
      freelancer: ethers.getAddress(params.freelancer),
      arbitrator: ethers.getAddress(params.arbitrator),
      agreementState: 'Unfunded',
      totalRequired: ethers.formatEther(sumWei),
      totalRequiredWei: sumWei,
      totalReserved: '0.00',
      totalReservedWei: 0n,
      totalCredited: '0.00',
      totalWithdrawn: '0.00',
      createdAt: now,
      milestones,
    };

    this.agreements.set(escrowAddr, agreement);
    this.contractBalances.set(escrowAddr, 0n);

    const credits = new Map<string, bigint>();
    credits.set(sender.address.toLowerCase(), 0n);
    credits.set(params.freelancer.toLowerCase(), 0n);
    this.withdrawableCredits.set(escrowAddr, credits);

    const gasUsed = 195400;
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: FACTORY_ADDRESS,
      action: 'createAgreement',
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      contractAddress: escrowAddr,
      events: [
        {
          name: 'AgreementCreated',
          signature:
            'AgreementCreated(address,address,address,address,string,uint256,uint256,uint256)',
          args: {
            escrowAddress: escrowAddr,
            client: sender.address,
            freelancer: params.freelancer,
            arbitrator: params.arbitrator,
            title: agreement.title,
            totalAmount: `${sumWei.toString()} (${ethers.formatEther(sumWei)} ETH)`,
            milestoneCount: milestones.length,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'created',
      title: 'New Escrow Agreement Created',
      message: `Agreement "${agreement.title}" was created with ${milestones.length} milestone(s) totaling ${agreement.totalRequired} ETH.`,
      contractAddress: escrowAddr,
      amountEth: agreement.totalRequired,
      severity: 'info',
    });

    this.notify();
    return { receipt: tx, agreementAddress: escrowAddr };
  }

  /**
   * Escrow: fundAgreement
   */
  public async fundAgreement(contractAddress: string): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found on local chain');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 62100;

    if (sender.address.toLowerCase() !== agr.client.toLowerCase()) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: 'fundAgreement',
        value: `${agr.totalRequired} ETH`,
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not client',
        gasUsed: 23400,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not client');
    }

    if (agr.agreementState !== 'Unfunded') {
      throw new Error('FreelanceEscrow: invalid agreement state (already funded)');
    }

    const clientBal = parseFloat(sender.balance);
    const reqEth = parseFloat(agr.totalRequired);
    if (clientBal < reqEth) {
      throw new Error('Insufficient local test ETH balance');
    }

    sender.balance = (clientBal - reqEth).toFixed(4);
    this.contractBalances.set(contractAddress, agr.totalRequiredWei);

    agr.agreementState = 'Active';
    agr.totalReservedWei = agr.totalRequiredWei;
    agr.totalReserved = agr.totalRequired;

    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: 'fundAgreement',
      value: `${agr.totalRequired} ETH`,
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'FundingReceived',
          signature: 'FundingReceived(address,uint256,uint256)',
          args: {
            client: sender.address,
            amount: `${agr.totalRequiredWei.toString()} (${agr.totalRequired} ETH)`,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'funded',
      title: 'Milestone Escrow Funded!',
      message: `Agreement "${agr.title}" was funded with ${agr.totalRequired} ETH by ${sender.name}. Milestone funds are now locked in smart contract escrow.`,
      contractAddress,
      txHash: tx.hash,
      amountEth: agr.totalRequired,
      severity: 'success',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: addMilestoneToAgreement (for Unfunded agreements before lock-in)
   */
  public async addMilestoneToAgreement(
    contractAddress: string,
    title: string,
    amount: string,
    deadlineDays: number
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found on local chain');

    if (sender.address.toLowerCase() !== agr.client.toLowerCase()) {
      throw new Error('Only the client can add milestones to an agreement');
    }

    if (agr.agreementState !== 'Unfunded') {
      throw new Error('Milestones can only be added prior to contract funding');
    }

    const amtEth = parseFloat(amount);
    if (isNaN(amtEth) || amtEth <= 0) {
      throw new Error('Milestone amount must be greater than 0 ETH');
    }

    const now = Math.floor(Date.now() / 1000);
    const amountWei = ethers.parseEther(amount);
    const deadline = now + (deadlineDays || 7) * 86400;
    const newIndex = agr.milestones.length;

    agr.milestones.push({
      index: newIndex,
      title: title.trim() || `Milestone ${newIndex + 1}`,
      amount: amtEth.toFixed(4),
      amountWei,
      deadline,
      state: 'Pending',
      submissionNote: '',
      freelancerShare: '0.0000',
      clientRefund: '0.0000',
    });

    agr.totalRequiredWei += amountWei;
    agr.totalRequired = (Number(agr.totalRequiredWei) / 1e18).toFixed(2);

    const gasUsed = 35000;
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `addMilestone[${newIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'MilestoneAdded',
          signature: 'MilestoneAdded(uint256,string,uint256,uint256)',
          args: {
            index: newIndex,
            title,
            amount: `${amountWei.toString()} (${amount} ETH)`,
            deadline,
          },
        },
      ],
    };

    this.transactions.unshift(tx);
    this.addNotification({
      type: 'created',
      title: 'Milestone Added to Agreement',
      message: `Milestone ${newIndex + 1} (${title}) was added to "${agr.title}". Total required funding is now ${agr.totalRequired} ETH.`,
      contractAddress,
      milestoneIndex: newIndex,
      txHash: tx.hash,
      amountEth: amount,
      severity: 'info',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: submitMilestone
   */
  public async submitMilestone(
    contractAddress: string,
    milestoneIndex: number,
    note: string
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 48200;

    if (sender.address.toLowerCase() !== agr.freelancer.toLowerCase()) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: `submitMilestone[${milestoneIndex}]`,
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not freelancer',
        gasUsed: 22100,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not freelancer');
    }

    if (agr.agreementState !== 'Active') {
      throw new Error('FreelanceEscrow: invalid agreement state');
    }

    const m = agr.milestones[milestoneIndex];
    if (!m) throw new Error('FreelanceEscrow: invalid milestone index');
    if (m.state !== 'Pending') {
      throw new Error('FreelanceEscrow: milestone not in Pending state');
    }
    if (now > m.deadline) {
      throw new Error('FreelanceEscrow: submission deadline passed');
    }

    m.state = 'Submitted';
    m.submissionNote = note.trim() || 'Work delivered for review';

    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `submitMilestone[${milestoneIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'MilestoneSubmitted',
          signature: 'MilestoneSubmitted(uint256,string,uint256)',
          args: {
            index: milestoneIndex,
            note: m.submissionNote,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'submitted',
      title: 'Milestone Work Submitted',
      message: `Milestone ${milestoneIndex + 1} (${m.title}) was submitted by ${sender.name} with deliverable note: "${m.submissionNote}".`,
      contractAddress,
      milestoneIndex,
      txHash: tx.hash,
      amountEth: m.amount,
      severity: 'info',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: approveMilestone (pull-over-push)
   */
  public async approveMilestone(
    contractAddress: string,
    milestoneIndex: number
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 59400;

    if (sender.address.toLowerCase() !== agr.client.toLowerCase()) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: `approveMilestone[${milestoneIndex}]`,
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not client',
        gasUsed: 22100,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not client');
    }

    if (agr.agreementState !== 'Active') {
      throw new Error('FreelanceEscrow: invalid agreement state');
    }

    const m = agr.milestones[milestoneIndex];
    if (!m) throw new Error('FreelanceEscrow: invalid milestone index');
    if (m.state !== 'Submitted') {
      throw new Error('FreelanceEscrow: milestone not in Submitted state');
    }

    // Checks-Effects
    m.state = 'Released';
    m.freelancerShare = m.amount;
    m.clientRefund = '0.00';

    agr.totalReservedWei -= m.amountWei;
    agr.totalReserved = ethers.formatEther(agr.totalReservedWei);

    // Credit withdrawable for freelancer
    const credits = this.withdrawableCredits.get(contractAddress)!;
    const currCredit = credits.get(agr.freelancer.toLowerCase()) || 0n;
    credits.set(agr.freelancer.toLowerCase(), currCredit + m.amountWei);

    const prevCredited = ethers.parseEther(agr.totalCredited);
    agr.totalCredited = ethers.formatEther(prevCredited + m.amountWei);

    this.checkAndSetCompletion(agr);
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `approveMilestone[${milestoneIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'MilestoneReleased',
          signature: 'MilestoneReleased(uint256,uint256,address,uint256)',
          args: {
            index: milestoneIndex,
            amount: `${m.amountWei.toString()} (${m.amount} ETH)`,
            freelancer: agr.freelancer,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'completed',
      title: 'Milestone Approved & Completed!',
      message: `Milestone ${milestoneIndex + 1} (${m.title}) on "${agr.title}" was approved by Client ${sender.name}! ${m.amount} ETH credited for freelancer withdrawal.`,
      contractAddress,
      milestoneIndex,
      txHash: tx.hash,
      amountEth: m.amount,
      severity: 'success',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: raiseDispute
   */
  public async raiseDispute(
    contractAddress: string,
    milestoneIndex: number
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 46500;

    const isClient = sender.address.toLowerCase() === agr.client.toLowerCase();
    const isFreelancer = sender.address.toLowerCase() === agr.freelancer.toLowerCase();
    if (!isClient && !isFreelancer) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: `raiseDispute[${milestoneIndex}]`,
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not client or freelancer',
        gasUsed: 21500,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not client or freelancer');
    }

    const m = agr.milestones[milestoneIndex];
    if (!m) throw new Error('FreelanceEscrow: invalid milestone index');
    if (m.state !== 'Submitted') {
      throw new Error('FreelanceEscrow: can only dispute Submitted milestone');
    }

    m.state = 'Disputed';
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `raiseDispute[${milestoneIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'DisputeRaised',
          signature: 'DisputeRaised(uint256,address,uint256)',
          args: {
            index: milestoneIndex,
            raisedBy: sender.address,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'disputed',
      title: 'Dispute Initiated on Milestone',
      message: `Dispute opened on Milestone ${milestoneIndex + 1} (${m.title}) by ${sender.name} (${sender.roleLabel}). Case escalated to Arbitrator.`,
      contractAddress,
      milestoneIndex,
      txHash: tx.hash,
      amountEth: m.amount,
      severity: 'warning',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: resolveDispute (Arbitrator basis points split)
   */
  public async resolveDispute(
    contractAddress: string,
    milestoneIndex: number,
    freelancerShareBps: number // 0 to 10,000
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 68400;

    if (sender.address.toLowerCase() !== agr.arbitrator.toLowerCase()) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: `resolveDispute[${milestoneIndex}]`,
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not arbitrator',
        gasUsed: 22800,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not arbitrator');
    }

    if (freelancerShareBps < 0 || freelancerShareBps > 10000) {
      throw new Error('FreelanceEscrow: basis points must be <= 10000');
    }

    const m = agr.milestones[milestoneIndex];
    if (!m) throw new Error('FreelanceEscrow: invalid milestone index');
    if (m.state !== 'Disputed') {
      throw new Error('FreelanceEscrow: milestone is not in Disputed state');
    }

    // Exact Integer arithmetic without remainder leakage
    const fShareWei = (m.amountWei * BigInt(freelancerShareBps)) / 10000n;
    const cRefundWei = m.amountWei - fShareWei;

    m.state = 'Resolved';
    m.freelancerShare = ethers.formatEther(fShareWei);
    m.clientRefund = ethers.formatEther(cRefundWei);

    agr.totalReservedWei -= m.amountWei;
    agr.totalReserved = ethers.formatEther(agr.totalReservedWei);

    const credits = this.withdrawableCredits.get(contractAddress)!;
    if (fShareWei > 0n) {
      const fCurr = credits.get(agr.freelancer.toLowerCase()) || 0n;
      credits.set(agr.freelancer.toLowerCase(), fCurr + fShareWei);
    }
    if (cRefundWei > 0n) {
      const cCurr = credits.get(agr.client.toLowerCase()) || 0n;
      credits.set(agr.client.toLowerCase(), cCurr + cRefundWei);
    }

    const prevCredited = ethers.parseEther(agr.totalCredited);
    agr.totalCredited = ethers.formatEther(prevCredited + m.amountWei);

    this.checkAndSetCompletion(agr);
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `resolveDispute[${milestoneIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'DisputeResolved',
          signature: 'DisputeResolved(uint256,address,uint256,uint256,uint256,uint256)',
          args: {
            index: milestoneIndex,
            arbitrator: sender.address,
            freelancerShareBps,
            freelancerAmount: `${fShareWei.toString()} (${m.freelancerShare} ETH)`,
            clientRefundAmount: `${cRefundWei.toString()} (${m.clientRefund} ETH)`,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'resolved',
      title: 'Dispute Resolved by Arbitrator',
      message: `Arbitrator ${sender.name} resolved dispute on Milestone ${milestoneIndex + 1} (${m.title}). Freelancer received ${m.freelancerShare} ETH, Client refunded ${m.clientRefund} ETH.`,
      contractAddress,
      milestoneIndex,
      txHash: tx.hash,
      amountEth: m.amount,
      severity: 'info',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: refundMilestone (unstarted pending milestone)
   */
  public async refundMilestone(
    contractAddress: string,
    milestoneIndex: number
  ): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 54300;

    if (sender.address.toLowerCase() !== agr.client.toLowerCase()) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: `refundMilestone[${milestoneIndex}]`,
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: caller is not client',
        gasUsed: 22100,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: caller is not client');
    }

    const m = agr.milestones[milestoneIndex];
    if (!m) throw new Error('FreelanceEscrow: invalid milestone index');
    if (m.state !== 'Pending') {
      throw new Error('FreelanceEscrow: can only refund Pending milestone');
    }

    m.state = 'Refunded';
    m.freelancerShare = '0.00';
    m.clientRefund = m.amount;

    agr.totalReservedWei -= m.amountWei;
    agr.totalReserved = ethers.formatEther(agr.totalReservedWei);

    const credits = this.withdrawableCredits.get(contractAddress)!;
    const cCurr = credits.get(agr.client.toLowerCase()) || 0n;
    credits.set(agr.client.toLowerCase(), cCurr + m.amountWei);

    const prevCredited = ethers.parseEther(agr.totalCredited);
    agr.totalCredited = ethers.formatEther(prevCredited + m.amountWei);

    this.checkAndSetCompletion(agr);
    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: `refundMilestone[${milestoneIndex}]`,
      value: '0.00 ETH',
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'MilestoneRefunded',
          signature: 'MilestoneRefunded(uint256,uint256,address,uint256)',
          args: {
            index: milestoneIndex,
            amount: `${m.amountWei.toString()} (${m.amount} ETH)`,
            client: sender.address,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'refunded',
      title: 'Milestone Refunded',
      message: `Milestone ${milestoneIndex + 1} (${m.title}) was refunded ${m.amount} ETH to Client ${sender.name}.`,
      contractAddress,
      milestoneIndex,
      txHash: tx.hash,
      amountEth: m.amount,
      severity: 'info',
    });

    this.notify();
    return tx;
  }

  /**
   * Escrow: withdraw
   */
  public async withdraw(contractAddress: string): Promise<TransactionRecord> {
    const sender = this.activeAccount;
    const agr = this.agreements.get(contractAddress);
    if (!agr) throw new Error('Contract not found');

    const now = Math.floor(Date.now() / 1000);
    const gasUsed = 41200;

    const credits = this.withdrawableCredits.get(contractAddress);
    const amountWei = credits?.get(sender.address.toLowerCase()) || 0n;

    if (amountWei <= 0n) {
      const revTx: TransactionRecord = {
        hash: this.generateTxHash(),
        blockNumber: ++this.currentBlock,
        from: sender.address,
        to: contractAddress,
        action: 'withdraw',
        value: '0.00 ETH',
        status: 'reverted',
        revertReason: 'FreelanceEscrow: no withdrawable balance',
        gasUsed: 21200,
        timestamp: now,
        events: [],
      };
      this.transactions.unshift(revTx);
      this.notify();
      throw new Error('FreelanceEscrow: no withdrawable balance');
    }

    credits!.set(sender.address.toLowerCase(), 0n);

    const contractBal = this.contractBalances.get(contractAddress) || 0n;
    this.contractBalances.set(contractAddress, contractBal - amountWei);

    const prevWithdrawn = ethers.parseEther(agr.totalWithdrawn);
    agr.totalWithdrawn = ethers.formatEther(prevWithdrawn + amountWei);

    const payoutEth = parseFloat(ethers.formatEther(amountWei));
    sender.balance = (parseFloat(sender.balance) + payoutEth).toFixed(4);

    this.deductGas(sender, gasUsed);

    const tx: TransactionRecord = {
      hash: this.generateTxHash(),
      blockNumber: ++this.currentBlock,
      from: sender.address,
      to: contractAddress,
      action: 'withdraw',
      value: `${ethers.formatEther(amountWei)} ETH`,
      status: 'success',
      gasUsed,
      timestamp: now,
      events: [
        {
          name: 'Withdrawal',
          signature: 'Withdrawal(address,uint256,uint256)',
          args: {
            recipient: sender.address,
            amount: `${amountWei.toString()} (${ethers.formatEther(amountWei)} ETH)`,
            timestamp: now,
          },
        },
      ],
    };

    this.transactions.unshift(tx);

    this.addNotification({
      type: 'withdrawn',
      recipientAddress: sender.address,
      title: 'Escrow Earnings Withdrawn',
      message: `Successfully transferred ${ethers.formatEther(amountWei)} ETH from escrow contract to ${sender.name}'s wallet balance.`,
      contractAddress,
      txHash: tx.hash,
      amountEth: ethers.formatEther(amountWei),
      severity: 'success',
    });

    this.notify();
    return tx;
  }

  private checkAndSetCompletion(agr: Agreement) {
    if (agr.totalReservedWei === 0n) {
      const allTerminal = agr.milestones.every(
        (m) => m.state === 'Released' || m.state === 'Resolved' || m.state === 'Refunded'
      );
      if (allTerminal) {
        agr.agreementState = 'Completed';
      }
    }
  }
}

export const evm = new EVMEngine();
