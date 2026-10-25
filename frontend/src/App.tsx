import React, { useEffect, useState } from 'react';
import { evm } from './services/evmEngine';
import { web3Service } from './services/web3Service';
import { Agreement, HardhatAccount, RpcNodeStatus, TransactionRecord } from './types/escrow';
import { Header } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
import { DashboardView } from './components/DashboardView';
import { AgreementDetailView } from './components/AgreementDetailView';
import { CreateAgreementView } from './components/CreateAgreementView';
import { TransactionInspectorView } from './components/TransactionInspectorView';
import { ResolutionCenterView } from './components/ResolutionCenterView';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { WalletModal } from './components/WalletModal';
import { NotificationToast } from './components/NotificationToast';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { HowItWorksView } from './components/HowItWorksView';
import { FeaturesView } from './components/FeaturesView';
import { SecurityView } from './components/SecurityView';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<
    'landing' | 'how-it-works' | 'features' | 'security' | 'dashboard' | 'projects' | 'create' | 'submissions' | 'earnings' | 'disputes' | 'inspector'
  >('landing');
  const [selectedAgreementAddr, setSelectedAgreementAddr] = useState<string | null>(null);
  const [activeAccount, setActiveAccount] = useState<HardhatAccount>(evm.getActiveAccount());
  const [agreements, setAgreements] = useState<Agreement[]>(evm.getAgreements());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(evm.getTransactions());
  const [rpcStatus, setRpcStatus] = useState<RpcNodeStatus>(evm.getRpcStatus());
  const [activeReceipt, setActiveReceipt] = useState<TransactionRecord | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] = useState(false);
  const [retryingRpc, setRetryingRpc] = useState(false);

  // Subscribe to EVM engine & RPC heartbeat state changes
  useEffect(() => {
    const unsubscribe = evm.subscribe(() => {
      setActiveAccount({ ...evm.getActiveAccount() });
      setAgreements(evm.getAgreements());
      setTransactions([...evm.getTransactions()]);
      setRpcStatus({ ...evm.getRpcStatus() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetryRpc = async () => {
    setRetryingRpc(true);
    await web3Service.checkLocalNode();
    await evm.syncWithLiveChain();
    setRetryingRpc(false);
  };

  const handleSelectAccount = (id: string) => {
    evm.setActiveAccount(id);
  };

  const handleConnectWallet = (id: string) => {
    evm.setActiveAccount(id);
    setIsLoggedIn(true);
    setSelectedAgreementAddr(null);
    setCurrentTab('dashboard');
  };

  const handleSelectAgreement = (addr: string) => {
    setSelectedAgreementAddr(addr);
    setCurrentTab('dashboard');
  };

  const handleBackToDashboard = () => {
    setSelectedAgreementAddr(null);
  };

  const handleAgreementCreated = (addr: string) => {
    setSelectedAgreementAddr(addr);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedAgreementAddr(null);
    setCurrentTab('landing');
  };

  const currentAgreement = selectedAgreementAddr
    ? agreements.find((a) => a.address.toLowerCase() === selectedAgreementAddr.toLowerCase())
    : null;

  return (
    <div className="min-h-screen relative bg-slate-50/90 text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Ambient Glass Backdrop Mesh Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-200/60 via-purple-200/50 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-gradient-to-bl from-blue-200/50 via-indigo-100/60 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-1/4 w-[30rem] h-[30rem] bg-gradient-to-tr from-violet-200/50 via-pink-100/40 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Global Application Header with Navigation Menu & Live RPC Status */}
        <Header
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedAgreementAddr(null);
            setCurrentTab(tab);
          }}
          isLoggedIn={isLoggedIn}
          activeAccount={activeAccount}
          rpcStatus={rpcStatus}
          onSelectAccount={handleSelectAccount}
          onOpenConnectWallet={() => setIsConnectWalletModalOpen(true)}
          onLogout={handleLogout}
          onOpenWallet={() => setIsWalletModalOpen(true)}
        />

        {/* Real-time Floating Event Alert Toast */}
        <NotificationToast onSelectAgreement={handleSelectAgreement} />

        {/* Main Viewport Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
          {/* Live Alert Banner if Hardhat Server is Closed/Offline */}
          {!rpcStatus.isNodeOnline && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50/95 backdrop-blur-md border border-rose-300 shadow-lg shadow-rose-950/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-950 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-rose-900">
                      Hardhat RPC Server Closed (http://127.0.0.1:8545 Offline) — Wallet Disconnected
                    </h4>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                      Node Unreachable
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    Your wallet cannot sign or verify transactions while the local Hardhat blockchain server is closed. Start{' '}
                    <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono font-bold">
                      npx hardhat node
                    </code>{' '}
                    in your terminal to restore live connection.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetryRpc}
                disabled={retryingRpc}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retryingRpc ? 'animate-spin' : ''}`} />
                <span>{retryingRpc ? 'Checking RPC...' : 'Reconnect to Hardhat'}</span>
              </button>
            </div>
          )}

          {/* If viewing a specific agreement */}
          {currentAgreement ? (
            <AgreementDetailView
              agreement={currentAgreement}
              activeAccount={activeAccount}
              onBack={handleBackToDashboard}
              onOpenReceipt={(tx) => setActiveReceipt(tx)}
              onNavigateInspector={() => setCurrentTab('inspector')}
            />
          ) : (
            <>
              {currentTab === 'landing' && (
                <LandingPageView
                  onConnectWallet={() => setIsConnectWalletModalOpen(true)}
                  onNavigateHowItWorks={() => {
                    setSelectedAgreementAddr(null);
                    setCurrentTab('how-it-works');
                  }}
                  onNavigateFeatures={() => {
                    setSelectedAgreementAddr(null);
                    setCurrentTab('features');
                  }}
                  onNavigateSecurity={() => {
                    setSelectedAgreementAddr(null);
                    setCurrentTab('security');
                  }}
                  onNavigateDisputes={() => setCurrentTab('disputes')}
                  onNavigateActivity={() => setCurrentTab('inspector')}
                />
              )}

              {currentTab === 'how-it-works' && (
                <HowItWorksView
                  onConnectWallet={() => setIsConnectWalletModalOpen(true)}
                />
              )}

              {currentTab === 'features' && (
                <FeaturesView
                  onConnectWallet={() => setIsConnectWalletModalOpen(true)}
                />
              )}

              {currentTab === 'security' && (
                <SecurityView
                  onConnectWallet={() => setIsConnectWalletModalOpen(true)}
                />
              )}

              {(currentTab === 'dashboard' ||
                currentTab === 'projects' ||
                currentTab === 'submissions' ||
                currentTab === 'earnings') && (
                <DashboardView
                  agreements={agreements}
                  activeAccount={activeAccount}
                  viewMode={
                    currentTab === 'projects'
                      ? 'projects'
                      : currentTab === 'submissions'
                      ? 'submissions'
                      : currentTab === 'earnings'
                      ? 'earnings'
                      : 'dashboard'
                  }
                  onSelectAgreement={handleSelectAgreement}
                  onNavigateCreate={() => setCurrentTab('create')}
                  onNavigateDisputes={() => setCurrentTab('disputes')}
                  onOpenReceipt={(tx) => setActiveReceipt(tx)}
                  onOpenWallet={() => setIsWalletModalOpen(true)}
                />
              )}

              {currentTab === 'create' && (
                <CreateAgreementView
                  activeAccount={activeAccount}
                  onAgreementCreated={handleAgreementCreated}
                  onOpenReceipt={(tx) => setActiveReceipt(tx)}
                />
              )}

              {currentTab === 'disputes' && (
                <ResolutionCenterView
                  agreements={agreements}
                  activeAccount={activeAccount}
                  onSelectAgreement={handleSelectAgreement}
                  onOpenReceipt={(tx) => setActiveReceipt(tx)}
                />
              )}

              {currentTab === 'inspector' && (
                <TransactionInspectorView
                  transactions={transactions}
                  rpcStatus={rpcStatus}
                  onOpenReceipt={(tx) => setActiveReceipt(tx)}
                />
              )}
            </>
          )}
        </main>

        {/* Non-Custodial Web3 Wallet Modal */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          activeAccount={activeAccount}
          agreements={agreements}
          rpcStatus={rpcStatus}
          onSelectAccount={handleSelectAccount}
          onLogout={handleLogout}
          onOpenReceipt={(tx) => setActiveReceipt(tx)}
        />

        {/* Large Connect Wallet Pop-up Modal */}
        <ConnectWalletModal
          isOpen={isConnectWalletModalOpen}
          onClose={() => setIsConnectWalletModalOpen(false)}
          onConnectAccount={handleConnectWallet}
          rpcStatus={rpcStatus}
        />

        {/* Transaction Receipt Modal */}
        <TransactionReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />

        {/* Platform Website Footer with Glass Effect & Live RPC Status */}
        <footer className="border-t border-white/80 bg-white/60 backdrop-blur-xl py-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 p-1 flex items-center justify-center shadow-xs">
                  <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">Freelance Milestone Escrow</span>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Strict Single-Role Architecture · OpenZeppelin ReentrancyGuard · ethers.js v6
                  </p>
                </div>
              </div>

              {/* Dynamic Protocol Status & Security Indicators */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                {rpcStatus.isNodeOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium text-[11px] font-mono">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    Hardhat RPC Connected · Chain {rpcStatus.chainId} · Block #{rpcStatus.latestBlock}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-bold text-[11px] font-mono">
                    <WifiOff className="w-3 h-3 text-rose-600" />
                    Hardhat RPC Disconnected (127.0.0.1:8545 Offline)
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium text-[11px]">
                  Non-Custodial Escrow
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium text-[11px]">
                  Verifiable On-Chain Receipts
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Direct Milestone Escrow Protection · 3 Single-Role Accounts (Alex, Stark, Mark)</span>
              <span>All transactions executed and verified on-chain via Solidity smart contracts</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
