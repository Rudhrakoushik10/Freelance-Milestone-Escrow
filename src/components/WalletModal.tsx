import React, { useState } from 'react';
import { evm } from '../services/evmEngine';
import { web3Service } from '../services/web3Service';
import { HardhatAccount, Agreement, RpcNodeStatus } from '../types/escrow';
import {
  X,
  Wallet,
  Copy,
  Check,
  ArrowDownLeft,
  Briefcase,
  Laptop,
  Scale,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Coins,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccount: HardhatAccount;
  agreements: Agreement[];
  rpcStatus: RpcNodeStatus;
  onSelectAccount: (id: string) => void;
  onLogout: () => void;
  onOpenReceipt: (tx: any) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  activeAccount,
  agreements,
  rpcStatus,
  onSelectAccount,
  onLogout,
  onOpenReceipt,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAccount.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSyncBalance = async () => {
    try {
      setSyncing(true);
      setWithdrawError(null);
      const isOnline = await web3Service.checkLocalNode();
      if (!isOnline) {
        setWithdrawError(
          'Hardhat RPC Server (http://127.0.0.1:8545) is offline. Please start "npx hardhat node".'
        );
      } else {
        await evm.syncWithLiveChain();
      }
    } finally {
      setSyncing(false);
    }
  };

  // Compute total withdrawable credits across agreements for active account
  let withdrawableEthTotal = 0;
  const withdrawableAgreements: { address: string; title: string; eth: string }[] = [];
  for (const agr of agreements) {
    const cred = evm.getWithdrawable(agr.address, activeAccount.address);
    const amt = parseFloat(cred.eth);
    if (amt > 0) {
      withdrawableEthTotal += amt;
      withdrawableAgreements.push({
        address: agr.address,
        title: agr.title,
        eth: cred.eth,
      });
    }
  }

  // Compute total committed in escrow by client
  let clientCommittedEth = 0;
  for (const agr of agreements) {
    if (agr.client.toLowerCase() === activeAccount.address.toLowerCase()) {
      clientCommittedEth += parseFloat(agr.totalReserved);
    }
  }

  const handleWithdrawAll = async () => {
    if (withdrawableAgreements.length === 0) return;
    try {
      setWithdrawing(true);
      setWithdrawError(null);
      for (const item of withdrawableAgreements) {
        const tx = await evm.withdraw(item.address);
        onOpenReceipt(tx);
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleResetData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    evm.resetState();
    setConfirmReset(false);
    onClose();
  };

  const accounts = evm.getAccounts();
  const clientAccounts = accounts.filter((a) => a.role === 'client');
  const freelancerAccounts = accounts.filter((a) => a.role === 'freelancer');
  const arbitratorAccounts = accounts.filter((a) => a.role === 'arbitrator');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/90 shadow-2xl overflow-hidden text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-white/50 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">
                  Non-Custodial Escrow Wallet
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeAccount.role === 'client'
                    ? 'bg-blue-100 text-blue-800'
                    : activeAccount.role === 'freelancer'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeAccount.roleLabel}
                </span>
                {rpcStatus.isNodeOnline ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    <WifiOff className="w-3 h-3 text-rose-600" />
                    Disconnected (Server Closed)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {rpcStatus.isNodeOnline
                  ? `Chain ID ${rpcStatus.chainId} · Hardhat RPC (${rpcStatus.rpcUrl}) · Block #${rpcStatus.latestBlock}`
                  : 'Hardhat RPC Server (http://127.0.0.1:8545) is OFFLINE'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {!rpcStatus.isNodeOnline && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Hardhat Server Closed — Wallet Disconnected
                </span>
                <button
                  onClick={handleSyncBalance}
                  disabled={syncing}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  Reconnect
                </button>
              </div>
              <p className="text-rose-700 leading-relaxed">
                The local Hardhat node at <code className="font-mono font-bold">http://127.0.0.1:8545</code> is not responding. Start <code className="font-mono font-bold">npx hardhat node</code> in your terminal to restore live wallet connectivity.
              </p>
            </div>
          )}

          {withdrawError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
              <span>{withdrawError}</span>
              <button
                onClick={() => setWithdrawError(null)}
                className="text-rose-700 font-bold underline text-[11px] ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Balance Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-indigo-200/80 block">
                  {rpcStatus.isNodeOnline
                    ? 'Live On-Chain Wallet Balance (Hardhat RPC)'
                    : 'Wallet Status: Disconnected (Hardhat Offline)'}
                </span>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="text-3xl font-extrabold font-mono tracking-tight">
                    {rpcStatus.isNodeOnline ? activeAccount.balance : '—'}{' '}
                    <span className="text-indigo-300 text-xl font-normal">ETH</span>
                  </div>
                  <button
                    onClick={handleSyncBalance}
                    disabled={syncing}
                    className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    title="Sync live ETH balance from http://127.0.0.1:8545"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Syncing...' : 'Sync RPC Balance'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-300">
                  <span className="truncate max-w-[220px] sm:max-w-[280px]">
                    {activeAccount.address}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
                    title="Copy Address"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-white/15 sm:pl-5 space-y-1">
                <span className="text-xs font-medium text-indigo-200/80 block">Account Profile</span>
                <div className="font-bold text-sm">{activeAccount.name}</div>
                <div className="text-xs font-mono text-indigo-300">@{activeAccount.username}</div>
              </div>
            </div>
          </div>

          {/* Role Status & Withdrawable Credits */}
          {activeAccount.role === 'freelancer' && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>Withdrawable Milestone Earnings:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-700">
                    {withdrawableEthTotal.toFixed(2)} ETH
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  {withdrawableEthTotal > 0
                    ? `${withdrawableAgreements.length} project(s) ready for direct pull-over-push withdrawal.`
                    : 'No pending earnings to withdraw at this time.'}
                </p>
              </div>
              {withdrawableEthTotal > 0 && (
                <button
                  onClick={handleWithdrawAll}
                  disabled={withdrawing || !rpcStatus.isNodeOnline}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  {withdrawing ? 'Processing...' : 'Withdraw to Wallet'}
                </button>
              )}
            </div>
          )}

          {activeAccount.role === 'client' && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-blue-950 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-sm block">Active Escrow Commitments</span>
                <p className="text-blue-800">
                  Total client funds locked in autonomous smart contract escrow:
                </p>
              </div>
              <div className="text-right font-mono font-extrabold text-base text-blue-700">
                {clientCommittedEth.toFixed(2)} ETH
              </div>
            </div>
          )}

          {/* Single-Role Enforcement Architecture Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Strict Single-Role Account Architecture</span>
            </div>
            <p className="leading-relaxed">
              Each account is permanently bound to exactly <strong>one role</strong> ({activeAccount.roleLabel}). Switch between the 3 dedicated accounts below:
            </p>
          </div>

          {/* Switch Single-Role Account */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Switch Non-Custodial Account by Role
            </label>

            {/* Clients */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Client Account (Alex)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {clientAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      acc.id === activeAccount.id
                        ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{acc.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username} · {acc.address.substring(0, 10)}...</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Freelancers */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                Freelancer Account (Stark)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {freelancerAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      acc.id === activeAccount.id
                        ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{acc.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username} · {acc.address.substring(0, 10)}...</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Arbitrators */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Arbitrator Account (Mark)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {arbitratorAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      acc.id === activeAccount.id
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{acc.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username} · {acc.address.substring(0, 10)}...</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {rpcStatus.isNodeOnline ? `${acc.balance} ETH` : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">Reset state?</span>
              <button
                onClick={handleResetData}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Node State
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
