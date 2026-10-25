import React, { useEffect, useState } from 'react';
import { evm } from './services/evmEngine';
import { Agreement, HardhatAccount, TransactionRecord } from './types/escrow';
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
import { ConnectWalletView } from './components/ConnectWalletView';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { HowItWorksView } from './components/HowItWorksView';
import { FeaturesView } from './components/FeaturesView';
import { SecurityView } from './components/SecurityView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<
    'landing' | 'how-it-works' | 'features' | 'security' | 'dashboard' | 'projects' | 'create' | 'submissions' | 'earnings' | 'disputes' | 'inspector'
  >('landing');
  const [selectedAgreementAddr, setSelectedAgreementAddr] = useState<string | null>(null);
  const [activeAccount, setActiveAccount] = useState<HardhatAccount>(evm.getActiveAccount());
  const [agreements, setAgreements] = useState<Agreement[]>(evm.getAgreements());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(evm.getTransactions());
  const [activeReceipt, setActiveReceipt] = useState<TransactionRecord | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] = useState(false);

  // Subscribe to EVM engine state changes
  useEffect(() => {
    const unsubscribe = evm.subscribe(() => {
      setActiveAccount(evm.getActiveAccount());
      setAgreements(evm.getAgreements());
      setTransactions(evm.getTransactions());
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
        {/* Global Application Header with Navigation Menu & Account Manager */}
        <Header
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedAgreementAddr(null);
            setCurrentTab(tab);
          }}
          isLoggedIn={isLoggedIn}
          activeAccount={activeAccount}
          onSelectAccount={handleSelectAccount}
          onOpenConnectWallet={() => setIsConnectWalletModalOpen(true)}
          onLogout={handleLogout}
          onOpenWallet={() => setIsWalletModalOpen(true)}
        />

        {/* Real-time Floating Event Alert Toast */}
        <NotificationToast onSelectAgreement={handleSelectAgreement} />

        {/* Main Viewport Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
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
          onSelectAccount={handleSelectAccount}
          onLogout={handleLogout}
          onOpenReceipt={(tx) => setActiveReceipt(tx)}
        />

        {/* Large Connect Wallet Pop-up Modal */}
        <ConnectWalletModal
          isOpen={isConnectWalletModalOpen}
          onClose={() => setIsConnectWalletModalOpen(false)}
          onConnectAccount={handleConnectWallet}
        />


        {/* Transaction Receipt Modal */}
        <TransactionReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />

        {/* Platform Website Footer with Glass Effect */}
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
                    Strict Single-Role Architecture · Decentralized Milestone Escrow Protocol
                  </p>
                </div>
              </div>

              {/* Protocol Status & Security Indicators */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  EVM Localnet · Chain 31337
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium text-[11px]">
                  Non-Custodial Escrow
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium text-[11px]">
                  Smart Contract Verified
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Direct Milestone Escrow Protection · Dedicated Non-Custodial Wallets</span>
              <span>All funds verified and backed on-chain via Solidity smart contracts</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
