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
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none transition-all duration-300">
      <div ref={containerRef} className="relative pointer-events-auto max-w-full">
        
        {/* Floating Capsule Nav Bar (Translucent White Glass) */}
        <nav className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/85 backdrop-blur-xl text-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-2xl shadow-2xl shadow-slate-900/15 border border-white/90 text-sm font-medium transition-all hover:bg-white/95 ring-1 ring-slate-900/5 max-w-full">
          
          {/* Logo */}
          <button
            onClick={() => setCurrentTab(isLoggedIn ? 'dashboard' : 'landing')}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 p-1 transition-colors shrink-0 shadow-xs"
            title="Freelance Milestone Escrow"
          >
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain filter drop-shadow-xs" />
          </button>

          {/* Live Hardhat RPC Status Pill */}
          <button
            onClick={handleRetryRpc}
            title={
              rpcStatus.isNodeOnline
                ? `Hardhat RPC Online (${rpcStatus.rpcUrl}) · Block #${rpcStatus.latestBlock}`
                : 'Hardhat RPC Server Closed (http://127.0.0.1:8545 Offline) — Click to retry connection'
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer shrink-0 ${
              rpcStatus.isNodeOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/80'
                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 animate-pulse'
            }`}
          >
            {rpcStatus.isNodeOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RPC Online · #{rpcStatus.latestBlock}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Hardhat Offline</span>
              </>
            )}
          </button>

          <div className="w-px h-4 bg-slate-200 mx-0.5 shrink-0" />

          {/* Navigation Links */}
          {!isLoggedIn ? (
            /* Pre-signin Navigation Menu - Distinct dedicated pages */
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => setCurrentTab('landing')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium ${
                  currentTab === 'landing'
                    ? 'text-slate-900 bg-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentTab('how-it-works')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium ${
                  currentTab === 'how-it-works'
                    ? 'text-slate-900 bg-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => setCurrentTab('features')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium ${
                  currentTab === 'features'
                    ? 'text-slate-900 bg-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setCurrentTab('security')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors text-xs sm:text-sm font-medium ${
                  currentTab === 'security'
                    ? 'text-slate-900 bg-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Security
              </button>
            </div>
          ) : (
            /* Post-signin Navigation Menu - Strictly Separated by Role */
            <div className="flex items-center gap-1 shrink-0">
              {activeAccount.role === 'client' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'dashboard'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('projects')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'projects'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => setCurrentTab('create')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'create'
                        ? 'text-indigo-950 bg-indigo-50 font-semibold border border-indigo-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden sm:inline-block ${
                      currentTab === 'inspector'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Wallet</span>
                  </button>
                </>
              )}

              {activeAccount.role === 'freelancer' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'dashboard'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('projects')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'projects'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => setCurrentTab('submissions')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'submissions'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Milestone Submissions
                  </button>
                  <button
                    onClick={() => setCurrentTab('earnings')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'earnings'
                        ? 'text-emerald-950 bg-emerald-50 font-semibold border border-emerald-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden md:inline-block ${
                      currentTab === 'inspector'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Wallet</span>
                  </button>
                </>
              )}

              {activeAccount.role === 'arbitrator' && (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'dashboard'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('disputes')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      currentTab === 'disputes'
                        ? 'text-amber-950 bg-amber-50 font-semibold border border-amber-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Active Disputes
                  </button>
                  <button
                    onClick={() => setCurrentTab('inspector')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium hidden sm:inline-block ${
                      currentTab === 'inspector'
                        ? 'text-slate-900 bg-slate-100/90 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={onOpenWallet}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5 text-amber-600" />
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
                className={`p-2 rounded-xl transition-all relative flex items-center justify-center ${
                  showNotificationDrawer
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Real-Time Notifications & Live Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-indigo-950/15 p-4 z-50 text-slate-800 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Real-Time Event Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => evm.markAllAsRead(activeAccount.address)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        No notifications yet. Alerts appear when milestones are funded, completed, or disputed.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            !n.read ? 'bg-indigo-50/60 border-indigo-200/80' : 'bg-slate-50/60 border-slate-200/40'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span className="truncate">{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-100 mt-3 pt-2 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationDrawer(false);
                        setCurrentTab('dashboard');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View Full Notification Center →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Pill & Dropdown (Reflects Live Hardhat Server Connection!) */}
          {isLoggedIn ? (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowAccountDropdown(!showAccountDropdown);
                  setShowNotificationDrawer(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-md active:scale-95 text-white ${
                  !rpcStatus.isNodeOnline
                    ? 'bg-rose-600 hover:bg-rose-500 ring-2 ring-rose-300'
                    : activeAccount.role === 'client'
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : activeAccount.role === 'freelancer'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {rpcStatus.isNodeOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span>{activeAccount.name}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:inline">
                  {rpcStatus.isNodeOnline ? activeAccount.roleLabel : 'Node Offline'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Account Dropdown */}
              {showAccountDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-indigo-950/15 p-3 z-50 text-slate-800 animate-in fade-in duration-150">
                  {/* Live RPC Node Connection Status Banner inside Dropdown */}
                  <div
                    className={`p-2.5 rounded-xl border mb-2.5 flex items-center justify-between text-xs ${
                      rpcStatus.isNodeOnline
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {rpcStatus.isNodeOnline ? (
                        <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-[11px]">
                          {rpcStatus.isNodeOnline
                            ? 'Wallet Connected to Hardhat RPC'
                            : 'Wallet Disconnected (Server Closed)'}
                        </div>
                        <div className="text-[10px] font-mono opacity-80">
                          {rpcStatus.isNodeOnline
                            ? `${rpcStatus.rpcUrl} · Block #${rpcStatus.latestBlock}`
                            : 'http://127.0.0.1:8545 is unreachable'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRetryRpc}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-slate-200 text-slate-700 cursor-pointer"
                      title="Refresh Hardhat RPC Status"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retryingNode ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Active Account Overview */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{activeAccount.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeAccount.role === 'client'
                          ? 'bg-blue-100 text-blue-800'
                          : activeAccount.role === 'freelancer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeAccount.roleLabel}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5 flex items-center justify-between">
                      <span>{activeAccount.address.substring(0, 10)}...{activeAccount.address.substring(34)}</span>
                      <button
                        onClick={(e) => handleCopyAddr(activeAccount.address, e)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Copy Address"
                      >
                        {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {rpcStatus.isNodeOnline ? 'Live Balance:' : 'Status:'}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {rpcStatus.isNodeOnline
                          ? `${activeAccount.balance} ETH`
                          : 'Disconnected (Node Offline)'}
                      </span>
                    </div>
                  </div>

                  {/* Single Role Architecture Explanatory Header */}
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Single-Role System (1 Account = 1 Role)</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="px-2 text-[11px] text-slate-500 leading-tight mb-2">
                    Switch between the 3 dedicated accounts below:
                  </p>

                  {/* Grouped Single-Role Account Switcher */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {/* Clients */}
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase px-1 mb-1 flex items-center gap-1">
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
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                                isCurrent
                                  ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="text-slate-900 font-medium">{acc.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">@{acc.username}</div>
                              </div>
                              <span className="font-mono text-[11px] text-slate-800">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Freelancers */}
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase px-1 mb-1 flex items-center gap-1">
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
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                                isCurrent
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="text-slate-900 font-medium">{acc.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">@{acc.username}</div>
                              </div>
                              <span className="font-mono text-[11px] text-slate-800">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Arbitrators */}
                    <div>
                      <div className="text-[10px] font-bold text-amber-600 uppercase px-1 mb-1 flex items-center gap-1">
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
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                                isCurrent
                                  ? 'bg-amber-50 border border-amber-200 text-amber-950 font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="text-slate-900 font-medium">{acc.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">@{acc.username}</div>
                              </div>
                              <span className="font-mono text-[11px] text-slate-800">
                                {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer Actions */}
                  <div className="border-t border-slate-100 mt-2.5 pt-2 flex items-center gap-2">
                    {confirmReset ? (
                      <div className="flex-1 flex items-center justify-between gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl">
                        <span className="text-[10px] text-rose-700 font-medium">Reset all?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleResetData}
                            className="text-[10px] font-bold text-white bg-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer shadow-2xs"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmReset(false)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer px-1"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleResetData}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Reset local state and sync with Hardhat node"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        Reset Data
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onLogout();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
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
