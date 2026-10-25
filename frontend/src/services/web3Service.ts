import { ethers } from 'ethers';
import {
  ESCROW_FACTORY_ARTIFACT,
  FREELANCE_MILESTONE_ESCROW_ARTIFACT,
} from './contractArtifacts';
import { DecodedEvent, RpcNodeStatus } from '../types/escrow';

export const FACTORY_ABI = ESCROW_FACTORY_ARTIFACT.abi;
export const ESCROW_ABI = FREELANCE_MILESTONE_ESCROW_ARTIFACT.abi;

export interface OnChainTxResult {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  nonce: number;
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPriceGwei: string;
  calldata: string;
  from: string;
  to: string;
  contractAddress?: string;
  events: DecodedEvent[];
  timestamp: number;
  executionSource: 'hardhat_rpc' | 'metamask_rpc';
}

export interface LiveReceiptVerification {
  verified: boolean;
  checkedAt: number;
  rpcUrl: string;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  gasUsed?: string;
  effectiveGasPriceGwei?: string;
  status?: string;
  confirmations?: number;
  from?: string;
  to?: string;
  nonce?: number;
  rawReceipt?: Record<string, any>;
  error?: string;
}

class Web3Service {
  private browserProvider: ethers.BrowserProvider | null = null;
  private jsonRpcProvider: ethers.JsonRpcProvider | null = null;
  private hardhatRpcUrl = 'http://127.0.0.1:8545';
  private listeners: Set<(status: RpcNodeStatus) => void> = new Set();
  private heartbeatTimer: any = null;

  public readonly factoryInterface = new ethers.Interface(FACTORY_ABI);
  public readonly escrowInterface = new ethers.Interface(ESCROW_ABI);

  private status: RpcNodeStatus = {
    isNodeOnline: false,
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: null,
    latestBlock: null,
    lastChecked: Date.now(),
    metaMaskConnected: false,
    metaMaskAddress: null,
    metaMaskChainId: null,
    factoryDeployedAddress: null,
    errorMessage: 'Checking Hardhat RPC server at http://127.0.0.1:8545...',
  };

  constructor() {
    this.initProvider();
    this.startHeartbeat();
    this.setupMetaMaskListeners();
  }

  private initProvider() {
    this.jsonRpcProvider = new ethers.JsonRpcProvider(this.hardhatRpcUrl, undefined, {
      staticNetwork: false,
      batchMaxCount: 1,
      cacheTimeout: -1, // Disable ethers internal RPC caching to prevent stale nonces
    });
  }

  private setupMetaMaskListeners() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      if (typeof ethereum.on === 'function') {
        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            this.status.metaMaskConnected = false;
            this.status.metaMaskAddress = null;
          } else {
            this.status.metaMaskConnected = true;
            this.status.metaMaskAddress = ethers.getAddress(accounts[0]);
          }
          this.notifyListeners();
        });

        ethereum.on('chainChanged', (chainIdHex: string) => {
          this.status.metaMaskChainId = parseInt(chainIdHex, 16);
          this.checkLocalNode();
        });

        ethereum.on('disconnect', () => {
          this.status.metaMaskConnected = false;
          this.status.metaMaskAddress = null;
          this.notifyListeners();
        });
      }
    }
  }

  public startHeartbeat() {
    this.checkLocalNode();
    if (typeof window !== 'undefined') {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        this.checkLocalNode();
      }, 2500);

      window.addEventListener('focus', () => {
        this.checkLocalNode();
      });
    }
  }

  public subscribeStatus(fn: (status: RpcNodeStatus) => void) {
    this.listeners.add(fn);
    fn(this.status);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notifyListeners() {
    const snapshot = { ...this.status };
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public getStatus(): RpcNodeStatus {
    return { ...this.status };
  }

  /**
   * Queries the exact next pending transaction nonce directly from the Hardhat RPC server
   * with `cache: 'no-store'` so `Nonce too low / nonce has already been used` never occurs.
   */
  public async getFreshNonce(address: string): Promise<number> {
    const response = await fetch(this.hardhatRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'pending'],
        id: Date.now(),
      }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (data && typeof data.result === 'string') {
      return parseInt(data.result, 16);
    }
    if (this.jsonRpcProvider) {
      return await this.jsonRpcProvider.getTransactionCount(address, 'pending');
    }
    return 0;
  }

  /**
   * Performs an uncached JSON-RPC ping to http://127.0.0.1:8545 so that
   * stopping `npx hardhat node` is detected immediately without stale caching.
   */
  public async checkLocalNode(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const response = await fetch(this.hardhatRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 },
          { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 },
        ]),
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const chainRes = Array.isArray(data) ? data.find((d) => d.id === 1) : data;
      const blockRes = Array.isArray(data) ? data.find((d) => d.id === 2) : null;

      const chainId = chainRes?.result ? parseInt(chainRes.result, 16) : 31337;
      const latestBlock = blockRes?.result ? parseInt(blockRes.result, 16) : 0;

      if (!this.jsonRpcProvider) {
        this.initProvider();
      }

      this.status = {
        ...this.status,
        isNodeOnline: true,
        chainId,
        latestBlock,
        lastChecked: Date.now(),
        errorMessage: undefined,
      };
      this.notifyListeners();
      return true;
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.status = {
        ...this.status,
        isNodeOnline: false,
        chainId: null,
        latestBlock: null,
        lastChecked: Date.now(),
        errorMessage:
          'Hardhat RPC server (http://127.0.0.1:8545) is offline or unreachable. Run "npx hardhat node" in your terminal.',
      };
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Fetches live ETH balances for an array of addresses directly from Hardhat RPC
   */
  public async fetchLiveBalances(addresses: string[]): Promise<Record<string, string> | null> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) return null;

    try {
      const results: Record<string, string> = {};
      await Promise.all(
        addresses.map(async (addr) => {
          const response = await fetch(this.hardhatRpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [addr, 'latest'],
              id: Date.now(),
            }),
            cache: 'no-store',
          });
          const data = await response.json();
          const balWei = data?.result ? BigInt(data.result) : 0n;
          results[addr.toLowerCase()] = parseFloat(ethers.formatEther(balWei)).toFixed(4);
        })
      );
      return results;
    } catch {
      return null;
    }
  }

  /**
   * Checks if bytecode exists at a given contract address on the live Hardhat node
   */
  public async hasContractCode(address: string): Promise<boolean> {
    if (!this.status.isNodeOnline) return false;
    try {
      const response = await fetch(this.hardhatRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [address, 'latest'],
          id: Date.now(),
        }),
        cache: 'no-store',
      });
      const data = await response.json();
      const code = data?.result;
      return Boolean(code && code !== '0x' && code !== '0x0');
    } catch {
      return false;
    }
  }

  /**
   * Ensures EscrowFactory is deployed on the running Hardhat node.
   * Uses a fresh provider and explicit uncached nonce so subsequent transactions never collide on nonce.
   */
  public async ensureFactoryDeployed(
    deployerPrivateKey: string,
    knownFactoryAddress?: string
  ): Promise<string> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) {
      throw new Error(
        'Hardhat RPC Server (http://127.0.0.1:8545) is OFFLINE. Wallet disconnected from local blockchain. Please run "npx hardhat node" in your terminal.'
      );
    }

    if (knownFactoryAddress && ethers.isAddress(knownFactoryAddress)) {
      const exists = await this.hasContractCode(knownFactoryAddress);
      if (exists) {
        this.status.factoryDeployedAddress = knownFactoryAddress;
        this.notifyListeners();
        return knownFactoryAddress;
      }
    }

    if (this.status.factoryDeployedAddress) {
      const exists = await this.hasContractCode(this.status.factoryDeployedAddress);
      if (exists) {
        return this.status.factoryDeployedAddress;
      }
    }

    // Deploy fresh EscrowFactory on the live Hardhat node with explicit fresh nonce
    const freshProvider = new ethers.JsonRpcProvider(this.hardhatRpcUrl, undefined, {
      staticNetwork: false,
      batchMaxCount: 1,
      cacheTimeout: -1,
    });
    const wallet = new ethers.Wallet(deployerPrivateKey, freshProvider);
    const freshNonce = await this.getFreshNonce(wallet.address);

    const factory = new ethers.ContractFactory(
      ESCROW_FACTORY_ARTIFACT.abi,
      ESCROW_FACTORY_ARTIFACT.bytecode,
      wallet
    );
    const contract = await factory.deploy({ nonce: freshNonce });
    await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();

    this.status.factoryDeployedAddress = deployedAddress;
    this.notifyListeners();
    return deployedAddress;
  }

  /**
   * Formats decoded event args cleanly for display in the receipt inspector
   */
  private formatEventArgs(fragment: ethers.EventFragment, args: ethers.Result): Record<string, any> {
    const formatted: Record<string, any> = {};
    fragment.inputs.forEach((input, idx) => {
      const key = input.name || `param_${idx}`;
      const val = args[idx];
      if (typeof val === 'bigint') {
        if (
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('share') ||
          key.toLowerCase().includes('refund')
        ) {
          formatted[key] = `${val.toString()} wei (${ethers.formatEther(val)} ETH)`;
        } else {
          formatted[key] = Number(val);
        }
      } else {
        formatted[key] = val;
      }
    });
    return formatted;
  }

  /**
   * Decodes all logs from a transaction receipt using EscrowFactory & FreelanceMilestoneEscrow ABIs
   */
  public decodeReceiptLogs(logs: readonly ethers.Log[]): DecodedEvent[] {
    const decoded: DecodedEvent[] = [];
    for (const log of logs) {
      let parsed = this.factoryInterface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (!parsed) {
        parsed = this.escrowInterface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
      }
      if (parsed && parsed.fragment) {
        decoded.push({
          name: parsed.name,
          signature: parsed.signature,
          args: this.formatEventArgs(parsed.fragment, parsed.args),
        });
      }
    }
    return decoded;
  }

  /**
   * Deploys a new FreelanceMilestoneEscrow contract via EscrowFactory on the live Hardhat node.
   * Explicitly manages the sender's pending nonce to prevent "nonce has already been used" errors.
   */
  public async executeCreateAgreementOnChain(params: {
    senderAddress: string;
    senderPrivateKey: string;
    factoryAddress: string;
    freelancer: string;
    arbitrator: string;
    title: string;
    milestoneTitles: string[];
    milestoneAmountsWei: bigint[];
    milestoneDeadlines: bigint[];
  }): Promise<OnChainTxResult & { deployedEscrowAddress: string }> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) {
      throw new Error(
        'Hardhat RPC Server (http://127.0.0.1:8545) is CLOSED / OFFLINE. Cannot execute transaction while disconnected from the Hardhat server.'
      );
    }

    const freshProvider = new ethers.JsonRpcProvider(this.hardhatRpcUrl, undefined, {
      staticNetwork: false,
      batchMaxCount: 1,
      cacheTimeout: -1,
    });

    const sendWithDirectRpcWallet = async (): Promise<{
      txResponse: ethers.ContractTransactionResponse;
      source: 'hardhat_rpc' | 'metamask_rpc';
    }> => {
      const wallet = new ethers.Wallet(params.senderPrivateKey, freshProvider);
      const freshNonce = await this.getFreshNonce(params.senderAddress);
      const factoryContract = new ethers.Contract(params.factoryAddress, FACTORY_ABI, wallet);
      const txResponse = await factoryContract.createAgreement(
        params.freelancer,
        params.arbitrator,
        params.title,
        params.milestoneTitles,
        params.milestoneAmountsWei,
        params.milestoneDeadlines,
        { nonce: freshNonce }
      );
      return { txResponse, source: 'hardhat_rpc' };
    };

    let txResponse: ethers.ContractTransactionResponse;
    let source: 'hardhat_rpc' | 'metamask_rpc' = 'hardhat_rpc';

    // If MetaMask is connected to the caller address, try MetaMask first; if MetaMask has a stale nonce cache, recover automatically with fresh RPC nonce
    if (
      this.status.metaMaskConnected &&
      this.browserProvider &&
      this.status.metaMaskAddress?.toLowerCase() === params.senderAddress.toLowerCase()
    ) {
      try {
        const mmSigner = await this.browserProvider.getSigner();
        const freshNonce = await this.getFreshNonce(params.senderAddress);
        const factoryContract = new ethers.Contract(params.factoryAddress, FACTORY_ABI, mmSigner);
        txResponse = await factoryContract.createAgreement(
          params.freelancer,
          params.arbitrator,
          params.title,
          params.milestoneTitles,
          params.milestoneAmountsWei,
          params.milestoneDeadlines,
          { nonce: freshNonce }
        );
        source = 'metamask_rpc';
      } catch (mmErr: any) {
        const msg = (mmErr?.message || '').toLowerCase();
        if (
          msg.includes('nonce') ||
          msg.includes('already been used') ||
          mmErr?.code === 'NONCE_EXPIRED' ||
          mmErr?.info?.error?.code === -32000
        ) {
          const fallback = await sendWithDirectRpcWallet();
          txResponse = fallback.txResponse;
          source = fallback.source;
        } else {
          throw mmErr;
        }
      }
    } else {
      const direct = await sendWithDirectRpcWallet();
      txResponse = direct.txResponse;
      source = direct.source;
    }

    const receipt = await txResponse.wait();
    if (!receipt) {
      throw new Error('Transaction was not mined by the Hardhat server');
    }

    const block = await freshProvider.getBlock(receipt.blockNumber);
    const events = this.decodeReceiptLogs(receipt.logs);

    let deployedEscrowAddress = '';
    for (const log of receipt.logs) {
      const parsed = this.factoryInterface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (parsed && parsed.name === 'AgreementCreated') {
        deployedEscrowAddress = ethers.getAddress(parsed.args[0]);
        break;
      }
    }

    if (!deployedEscrowAddress) {
      const readerContract = new ethers.Contract(params.factoryAddress, FACTORY_ABI, freshProvider);
      const allEscrows: string[] = await readerContract.getAllEscrows();
      deployedEscrowAddress = ethers.getAddress(allEscrows[allEscrows.length - 1]);
    }

    await this.checkLocalNode();

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      transactionIndex: receipt.index,
      nonce: txResponse.nonce,
      gasUsed: Number(receipt.gasUsed),
      cumulativeGasUsed: Number(receipt.cumulativeGasUsed),
      effectiveGasPriceGwei: ethers.formatUnits(receipt.gasPrice ?? 0n, 'gwei'),
      calldata: txResponse.data,
      from: ethers.getAddress(receipt.from),
      to: ethers.getAddress(receipt.to ?? params.factoryAddress),
      contractAddress: deployedEscrowAddress,
      deployedEscrowAddress,
      events,
      timestamp: block ? Number(block.timestamp) : Math.floor(Date.now() / 1000),
      executionSource: source,
    };
  }

  /**
   * Executes a state-changing method on a deployed FreelanceMilestoneEscrow contract on the live Hardhat node.
   * Explicitly queries and passes the fresh pending nonce so nonce collisions never occur.
   */
  public async executeEscrowMethodOnChain(params: {
    senderAddress: string;
    senderPrivateKey: string;
    contractAddress: string;
    methodName:
      | 'fundAgreement'
      | 'submitMilestone'
      | 'approveMilestone'
      | 'raiseDispute'
      | 'resolveDispute'
      | 'refundMilestone'
      | 'withdraw';
    args: any[];
    valueWei?: bigint;
  }): Promise<OnChainTxResult> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) {
      throw new Error(
        'Hardhat RPC Server (http://127.0.0.1:8545) is CLOSED / OFFLINE. Cannot execute transaction while disconnected from the Hardhat server.'
      );
    }

    const codeExists = await this.hasContractCode(params.contractAddress);
    if (!codeExists) {
      throw new Error(
        `No contract bytecode found at ${params.contractAddress} on Hardhat node (http://127.0.0.1:8545). If you restarted "npx hardhat node", click "Reset Data" to sync with the fresh chain.`
      );
    }

    const freshProvider = new ethers.JsonRpcProvider(this.hardhatRpcUrl, undefined, {
      staticNetwork: false,
      batchMaxCount: 1,
      cacheTimeout: -1,
    });

    const sendWithDirectRpcWallet = async (): Promise<{
      txResponse: ethers.ContractTransactionResponse;
      source: 'hardhat_rpc' | 'metamask_rpc';
    }> => {
      const wallet = new ethers.Wallet(params.senderPrivateKey, freshProvider);
      const freshNonce = await this.getFreshNonce(params.senderAddress);
      const escrowContract = new ethers.Contract(params.contractAddress, ESCROW_ABI, wallet);
      const overrides: Record<string, any> = { nonce: freshNonce };
      if (params.valueWei && params.valueWei > 0n) {
        overrides.value = params.valueWei;
      }
      const txResponse = await escrowContract[params.methodName](...params.args, overrides);
      return { txResponse, source: 'hardhat_rpc' };
    };

    let txResponse: ethers.ContractTransactionResponse;
    let source: 'hardhat_rpc' | 'metamask_rpc' = 'hardhat_rpc';

    if (
      this.status.metaMaskConnected &&
      this.browserProvider &&
      this.status.metaMaskAddress?.toLowerCase() === params.senderAddress.toLowerCase()
    ) {
      try {
        const mmSigner = await this.browserProvider.getSigner();
        const freshNonce = await this.getFreshNonce(params.senderAddress);
        const escrowContract = new ethers.Contract(params.contractAddress, ESCROW_ABI, mmSigner);
        const overrides: Record<string, any> = { nonce: freshNonce };
        if (params.valueWei && params.valueWei > 0n) {
          overrides.value = params.valueWei;
        }
        txResponse = await escrowContract[params.methodName](...params.args, overrides);
        source = 'metamask_rpc';
      } catch (mmErr: any) {
        const msg = (mmErr?.message || '').toLowerCase();
        if (
          msg.includes('nonce') ||
          msg.includes('already been used') ||
          mmErr?.code === 'NONCE_EXPIRED' ||
          mmErr?.info?.error?.code === -32000
        ) {
          const fallback = await sendWithDirectRpcWallet();
          txResponse = fallback.txResponse;
          source = fallback.source;
        } else {
          throw mmErr;
        }
      }
    } else {
      const direct = await sendWithDirectRpcWallet();
      txResponse = direct.txResponse;
      source = direct.source;
    }

    const receipt = await txResponse.wait();
    if (!receipt) {
      throw new Error('Transaction was not mined by the Hardhat server');
    }

    const block = await freshProvider.getBlock(receipt.blockNumber);
    const events = this.decodeReceiptLogs(receipt.logs);

    await this.checkLocalNode();

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      transactionIndex: receipt.index,
      nonce: txResponse.nonce,
      gasUsed: Number(receipt.gasUsed),
      cumulativeGasUsed: Number(receipt.cumulativeGasUsed),
      effectiveGasPriceGwei: ethers.formatUnits(receipt.gasPrice ?? 0n, 'gwei'),
      calldata: txResponse.data,
      from: ethers.getAddress(receipt.from),
      to: ethers.getAddress(receipt.to ?? params.contractAddress),
      events,
      timestamp: block ? Number(block.timestamp) : Math.floor(Date.now() / 1000),
      executionSource: source,
    };
  }

  /**
   * Queries the live Hardhat RPC server (`eth_getTransactionReceipt` & `eth_getTransactionByHash`)
   * to cryptographically verify that a transaction hash exists on-chain.
   */
  public async verifyTransactionOnChain(txHash: string): Promise<LiveReceiptVerification> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) {
      return {
        verified: false,
        checkedAt: Date.now(),
        rpcUrl: this.hardhatRpcUrl,
        error:
          'Hardhat RPC Server (http://127.0.0.1:8545) is OFFLINE. Cannot verify transaction while the Hardhat node is closed.',
      };
    }

    try {
      const freshProvider = new ethers.JsonRpcProvider(this.hardhatRpcUrl, undefined, {
        staticNetwork: false,
        batchMaxCount: 1,
        cacheTimeout: -1,
      });

      const [receipt, tx, currentBlock] = await Promise.all([
        freshProvider.getTransactionReceipt(txHash),
        freshProvider.getTransaction(txHash),
        freshProvider.getBlockNumber(),
      ]);

      if (!receipt || !tx) {
        return {
          verified: false,
          checkedAt: Date.now(),
          rpcUrl: this.hardhatRpcUrl,
          error: `Transaction ${txHash.substring(0, 14)}... was not found on the current Hardhat node (Chain 31337). The node may have been restarted since this transaction was recorded.`,
        };
      }

      return {
        verified: true,
        checkedAt: Date.now(),
        rpcUrl: this.hardhatRpcUrl,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.index,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPriceGwei: ethers.formatUnits(receipt.gasPrice ?? 0n, 'gwei'),
        status: receipt.status === 1 ? '0x1 (Success)' : '0x0 (Reverted)',
        confirmations: Math.max(1, currentBlock - receipt.blockNumber + 1),
        from: receipt.from,
        to: receipt.to ?? undefined,
        nonce: tx.nonce,
        rawReceipt: {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          transactionIndex: receipt.index,
          from: receipt.from,
          to: receipt.to,
          gasUsed: receipt.gasUsed.toString(),
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          effectiveGasPrice: (receipt.gasPrice ?? 0n).toString(),
          status: receipt.status,
          logsCount: receipt.logs.length,
        },
      };
    } catch (err: any) {
      return {
        verified: false,
        checkedAt: Date.now(),
        rpcUrl: this.hardhatRpcUrl,
        error: err.message || 'RPC verification query failed',
      };
    }
  }

  /**
   * Connects to MetaMask or injected Web3 provider using ethers.BrowserProvider
   */
  public async connectMetaMask(): Promise<{ address: string; chainId: string }> {
    const isOnline = await this.checkLocalNode();
    if (!isOnline) {
      throw new Error(
        'Hardhat RPC Server (http://127.0.0.1:8545) is offline! Please start "npx hardhat node" before connecting your wallet.'
      );
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask or Web3 wallet extension not detected in browser');
    }

    const ethereum = (window as any).ethereum;
    this.browserProvider = new ethers.BrowserProvider(ethereum);

    const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No account authorized in MetaMask');
    }

    const network = await this.browserProvider.getNetwork();
    const chainIdHex = '0x' + network.chainId.toString(16);

    if (network.chainId !== 31337n) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hex
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7a69',
                  chainName: 'Hardhat Localhost 8545',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                },
              ],
            });
          } catch (addError) {
            console.warn('Could not add Hardhat network to MetaMask automatically', addError);
          }
        }
      }
    }

    const checksumAddr = ethers.getAddress(accounts[0]);
    this.status.metaMaskConnected = true;
    this.status.metaMaskAddress = checksumAddr;
    this.status.metaMaskChainId = 31337;
    this.notifyListeners();

    return { address: checksumAddr, chainId: chainIdHex };
  }

  public getJsonRpcProvider(): ethers.JsonRpcProvider | null {
    return this.jsonRpcProvider;
  }

  public getBrowserProvider(): ethers.BrowserProvider | null {
    return this.browserProvider;
  }
}

export const web3Service = new Web3Service();
