import React, { useState, useRef, useEffect } from 'react';
import { evm } from '../services/evmEngine';
import { web3Service } from '../services/web3Service';
import { HardhatAccount, NotificationRecord, RpcNodeStatus } from '../types/escrow';
import {
  Check,
  LogOut,
  Briefcase,
  Laptop,
  Copy,
  RotateCcw,
  ChevronDown,
  Bell,
  CheckCheck,
  Wallet,
  ShieldCheck,
  Scale,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  isLoggedIn: boolean;
  activeAccount: HardhatAccount;
  rpcStatus: RpcNodeStatus;
  onSelectAccount: (id: string) => void;
  onOpenConnectWallet: () => void;
  onLogout: () => void;
  onOpenWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isLoggedIn,
  activeAccount,
  rpcStatus,
  onSelectAccount,
  onOpenConnectWallet,
  onLogout,
  onOpenWallet,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [retryingNode, setRetryingNode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = evm.getUnreadCount(activeAccount.address);
  const notifications: NotificationRecord[] = evm.getNotifications(activeAccount.address);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
        setShowNotificationDrawer(false);
        setConfirmReset(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddr = (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleRetryRpc = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryingNode(true);
    await web3Service.checkLocalNode();
    await evm.syncWithLiveChain();
    setRetryingNode(false);
  };

  const handleResetData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    evm.resetState();
    setConfirmReset(false);
    setShowAccountDropdown(false);
  };

  const accounts = evm.getAccounts();
  const clientAccounts = accounts.filter((a) => a.role === 'client');
  const freelancerAccounts = accounts.filter((a) => a.role === 'freelancer');
  const arbitratorAccounts = accounts.filter((a) => a.role === 'arbitrator');

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none transition-all duration-200">
      <div ref={containerRef} className="relative pointer-events-auto max-w-full">
        {/* Architectural Charcoal Black Navigation Bar */}
        <nav className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#111312] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl border border-white/15 text-sm font-medium max-w-full">
          {/* Logo */}
          <button
            onClick={() => setCurrentTab(isLoggedIn ? 'dashboard' : 'landing')}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#14532D] hover:bg-[#166534] p-1.5 transition-colors shrink-0 border border-white/15 cursor-pointer"
            title="Freelance Milestone Escrow"
          >
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </button>

          {/* Live Hardhat RPC Telemetry Button */}
          <button
            onClick={handleRetryRpc}
            title={
              rpcStatus.isNodeOnline
                ? `Hardhat RPC Online (${rpcStatus.rpcUrl}) · Block #${rpcStatus.latestBlock}`
                : 'Hardhat RPC Server Closed (http://127.0.0.1:8545 Offline) — Click to retry connection'
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              rpcStatus.isNodeOnline
                ? 'bg-[#14532D] text-white border-white/20 hover:bg-[#166534]'
                : 'bg-[#991B1B] text-white border-white/20 hover:bg-[#B91C1C]'
            }`}
          >
            {rpcStatus.isNodeOnline ? (
              <>
                <Wifi className="w-3 h-3 text-white" />
                <span>RPC Online · #{rpcStatus.latestBlock}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-white" />
                <span>Hardhat Offline</span>
              </>
            )}
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5 shrink-0" />

          {/* Navigation Links */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => setCurrentTab('landing')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                  currentTab === 'landing'
                    ? 'bg-white text-[#111312] font-bold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentTab('how-it-works')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                  currentTab === 'how-it-works'
                    ? 'bg-white text-[#111312] font-bold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => setCurrentTab('features')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                  currentTab === 'features'
                    ? 'bg-white text-[#111312] font-bold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setCurrentTab('security')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                  currentTab === 'security'
                    ? 'bg-white text-[#111312] font-bold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                Security
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              {activeAccount.role === 'client' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('projects')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'projects'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => setCurrentTab('create')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'create'
                        ? 'bg-[#14532D] text-white font-bold border border-white/20'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden sm:inline-block whitespace-nowrap cursor-pointer ${
                      currentTab === 'inspector'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-white" />
                    <span>Wallet</span>
                  </button>
                </>
              )}

              {activeAccount.role === 'freelancer' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('projects')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'projects'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => setCurrentTab('submissions')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'submissions'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Milestone Submissions
                  </button>
                  <button
                    onClick={() => setCurrentTab('earnings')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'earnings'
                        ? 'bg-[#14532D] text-white font-bold border border-white/20'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden md:inline-block whitespace-nowrap cursor-pointer ${
                      currentTab === 'inspector'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-white" />
                    <span>Wallet</span>
                  </button>
                </>
              )}

              {activeAccount.role === 'arbitrator' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('disputes')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
                      currentTab === 'disputes'
                        ? 'bg-[#991B1B] text-white font-bold border border-white/20'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Active Disputes
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden sm:inline-block whitespace-nowrap cursor-pointer ${
                      currentTab === 'inspector'
                        ? 'bg-white text-[#111312] font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-white" />
                    <span>Wallet</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Real-time Notification Bell Icon */}
          {isLoggedIn && (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowNotificationDrawer(!showNotificationDrawer);
                  setShowAccountDropdown(false);
                }}
                className={`p-2 rounded-xl transition-all relative flex items-center justify-center cursor-pointer ${
                  showNotificationDrawer
                    ? 'bg-[#14532D] text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                title="Real-Time Notifications & Live Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#991B1B] text-[9px] font-bold text-white ring-2 ring-[#111312]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-[#111312]/15 shadow-2xl p-4 z-50 text-[#111312] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#111312]/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#14532D]" />
                      <span className="text-xs font-bold text-[#111312]">Real-Time Event Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#991B1B] text-white font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => evm.markAllAsRead(activeAccount.address)}
                        className="text-[11px] text-[#14532D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#111312]/50">
                        No notifications yet. Alerts appear when milestones are funded, completed, or disputed.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            !n.read
                              ? 'bg-[#14532D]/[0.06] border-[#14532D]/30'
                              : 'bg-[#F7F8F7] border-[#111312]/10'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[#111312] mb-1">
                            <span className="truncate">{n.title}</span>
                            {!n.read && (
                              <span className="text-[10px] font-mono text-[#14532D] font-bold shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#111312]/70 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-[#111312]/10 mt-3 pt-2 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationDrawer(false);
                        setCurrentTab('dashboard');
                      }}
                      className="text-xs font-bold text-[#14532D] hover:underline transition-colors cursor-pointer"
                    >
                      View Full Notification Center →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Switcher Button & Dropdown */}
          {isLoggedIn ? (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowAccountDropdown(!showAccountDropdown);
                  setShowNotificationDrawer(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm px-3 py-1.5 sm:py-2 rounded-xl transition-all border cursor-pointer whitespace-nowrap ${
                  !rpcStatus.isNodeOnline
                    ? 'bg-[#991B1B] hover:bg-[#B91C1C] text-white border-white/25'
                    : activeAccount.role === 'client'
                    ? 'bg-white text-[#111312] hover:bg-[#F7F8F7] border-white'
                    : activeAccount.role === 'freelancer'
                    ? 'bg-[#14532D] hover:bg-[#166534] text-white border-white/25'
                    : 'bg-[#991B1B] hover:bg-[#B91C1C] text-white border-white/25'
                }`}
              >
                {rpcStatus.isNodeOnline ? (
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{activeAccount.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:inline ${
                    activeAccount.role === 'client' && rpcStatus.isNodeOnline
                      ? 'bg-[#111312] text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {rpcStatus.isNodeOnline ? activeAccount.roleLabel : 'Node Offline'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Account Dropdown */}
              {showAccountDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-2xl bg-white border border-[#111312]/15 shadow-2xl p-3 z-50 text-[#111312] animate-in fade-in duration-150">
                  {/* Live RPC Node Connection Status Banner inside Dropdown */}
                  <div
                    className={`p-2.5 rounded-xl border mb-2.5 flex items-center justify-between text-xs ${
                      rpcStatus.isNodeOnline
                        ? 'bg-[#14532D]/[0.08] border-[#14532D]/30 text-[#14532D]'
                        : 'bg-[#991B1B]/[0.08] border-[#991B1B]/30 text-[#991B1B]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {rpcStatus.isNodeOnline ? (
                        <Wifi className="w-4 h-4 text-[#14532D] shrink-0" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-[#991B1B] shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-[11px]">
                          {rpcStatus.isNodeOnline
                            ? 'Wallet Connected to Hardhat RPC'
                            : 'Wallet Disconnected (Server Closed)'}
                        </div>
                        <div className="text-[10px] font-mono opacity-85">
                          {rpcStatus.isNodeOnline
                            ? `${rpcStatus.rpcUrl} · Block #${rpcStatus.latestBlock}`
                            : 'http://127.0.0.1:8545 is unreachable'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRetryRpc}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F7F8F7] border border-[#111312]/15 text-[#111312] cursor-pointer"
                      title="Refresh Hardhat RPC Status"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retryingNode ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Active Account Overview */}
                  <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111312]">{activeAccount.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          activeAccount.role === 'client'
                            ? 'bg-[#111312] text-white'
                            : activeAccount.role === 'freelancer'
                            ? 'bg-[#14532D] text-white'
                            : 'bg-[#991B1B] text-white'
                        }`}
                      >
                        {activeAccount.roleLabel}
                      </span>
                    </div>
                    <div className="text-xs text-[#14532D] font-mono mt-1 flex items-center justify-between">
                      <span>
                        {activeAccount.address.substring(0, 10)}...{activeAccount.address.substring(34)}
                      </span>
                      <button
                        onClick={(e) => handleCopyAddr(activeAccount.address, e)}
                        className="text-[#111312]/50 hover:text-[#111312] p-1 cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedAddress ? (
                          <Check className="w-3 h-3 text-[#14532D]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#111312]/10 flex items-center justify-between text-xs">
                      <span className="text-[#111312]/60">
                        {rpcStatus.isNodeOnline ? 'Live Balance:' : 'Status:'}
                      </span>
                      <span className="font-mono font-bold text-[#111312]">
                        {rpcStatus.isNodeOnline
                          ? `${activeAccount.balance} ETH`
                          : 'Disconnected (Node Offline)'}
                      </span>
                    </div>
                  </div>

                  {/* Single Role Architecture Explanatory Header */}
                  <div className="px-2 py-1 text-[10px] font-bold text-[#111312]/60 uppercase tracking-wider flex items-center justify-between">
                    <span>Single-Role System (1 Account = 1 Role)</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" />
                  </div>
                  <p className="px-2 text-[11px] text-[#111312]/60 leading-tight mb-2">
                    Switch between the 3 dedicated accounts below:
                  </p>

                  {/* Grouped Single-Role Account Switcher */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {/* Clients */}
                    <div>
                      <div className="text-[10px] font-bold text-[#111312] uppercase px-1 mb-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Client Account
                      </div>
                      <div className="space-y-1">
                        {clientAccounts.map((acc) => {
                          const isCurrent = acc.id === activeAccount.id;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                onSelectAccount(acc.id);
                                setShowAccountDropdown(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#111312] text-white font-bold'
                                  : 'hover:bg-[#F7F8F7] text-[#111312] border border-[#111312]/10'
                              }`}
                            >
                              <div>
                                <div className="font-semibold">{acc.name}</div>
                                <div
                                  className={`text-[10px] font-mono ${
                                    isCurrent ? 'text-white/70' : 'text-[#111312]/50'
                                  }`}
                                >
                                  @{acc.username}
                                </div>
                              </div>
                              <span className="font-mono text-[11px]">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Freelancers */}
                    <div>
                      <div className="text-[10px] font-bold text-[#14532D] uppercase px-1 mb-1 flex items-center gap-1">
                        <Laptop className="w-3 h-3" /> Freelancer Account
                      </div>
                      <div className="space-y-1">
                        {freelancerAccounts.map((acc) => {
                          const isCurrent = acc.id === activeAccount.id;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                onSelectAccount(acc.id);
                                setShowAccountDropdown(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#14532D] text-white font-bold'
                                  : 'hover:bg-[#F7F8F7] text-[#111312] border border-[#111312]/10'
                              }`}
                            >
                              <div>
                                <div className="font-semibold">{acc.name}</div>
                                <div
                                  className={`text-[10px] font-mono ${
                                    isCurrent ? 'text-white/75' : 'text-[#111312]/50'
                                  }`}
                                >
                                  @{acc.username}
                                </div>
                              </div>
                              <span className="font-mono text-[11px]">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Arbitrators */}
                    <div>
                      <div className="text-[10px] font-bold text-[#991B1B] uppercase px-1 mb-1 flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Arbitrator Account
                      </div>
                      <div className="space-y-1">
                        {arbitratorAccounts.map((acc) => {
                          const isCurrent = acc.id === activeAccount.id;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                onSelectAccount(acc.id);
                                setShowAccountDropdown(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#991B1B] text-white font-bold'
                                  : 'hover:bg-[#F7F8F7] text-[#111312] border border-[#111312]/10'
                              }`}
                            >
                              <div>
                                <div className="font-semibold">{acc.name}</div>
                                <div
                                  className={`text-[10px] font-mono ${
                                    isCurrent ? 'text-white/75' : 'text-[#111312]/50'
                                  }`}
                                >
                                  @{acc.username}
                                </div>
                              </div>
                              <span className="font-mono text-[11px]">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer Actions */}
                  <div className="border-t border-[#111312]/10 mt-2.5 pt-2 flex items-center gap-2">
                    {confirmReset ? (
                      <div className="flex-1 flex items-center justify-between gap-1 bg-[#991B1B]/10 border border-[#991B1B]/30 px-2 py-1 rounded-xl">
                        <span className="text-[10px] text-[#991B1B] font-bold">Reset all?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleResetData}
                            className="text-[10px] font-bold text-white bg-[#991B1B] px-2 py-0.5 rounded hover:bg-[#B91C1C] cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmReset(false)}
                            className="text-[10px] text-[#111312]/70 hover:text-[#111312] cursor-pointer px-1"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleResetData}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-[#111312]/70 hover:text-[#111312] hover:bg-[#F7F8F7] rounded-xl transition-colors cursor-pointer"
                        title="Reset local state and sync with Hardhat node"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Data
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onLogout();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#991B1B]/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenConnectWallet}
              className="bg-[#14532D] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all border border-white/20 shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Your Wallet</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
