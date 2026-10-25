import React, { useState } from 'react';
import { HARDHAT_ACCOUNTS, evm } from '../services/evmEngine';
import { HardhatAccount, Agreement } from '../types/escrow';
import {
  X,
  Wallet,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Laptop,
  Scale,
  RotateCcw,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Coins,
  CheckCircle2,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccount: HardhatAccount;
  agreements: Agreement[];
  onSelectAccount: (id: string) => void;
  onLogout: () => void;
  onOpenReceipt: (tx: any) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  activeAccount,
  agreements,
  onSelectAccount,
  onLogout,
  onOpenReceipt,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAccount.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
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
      for (const item of withdrawableAgreements) {
        const tx = await evm.withdraw(item.address);
        onOpenReceipt(tx);
      }
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset local EVM testnet state and re-seed defaults?')) {
      evm.resetState();
      onClose();
    }
  };

  const clientAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'client');
  const freelancerAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'freelancer');
  const arbitratorAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'arbitrator');

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
              <div className="flex items-center gap-2">
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
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Chain ID 31337 · Local EVM Testnet Node
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
          {/* Active Balance Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-indigo-200/80 block">
                  Available Wallet Balance
                </span>
                <div className="text-3xl font-extrabold font-mono tracking-tight mt-0.5">
                  {activeAccount.balance} <span className="text-indigo-300 text-xl font-normal">ETH</span>
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
                  disabled={withdrawing}
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
              In this decentralized escrow system, each account is permanently bound to exactly <strong>one role</strong> ({activeAccount.roleLabel}) to eliminate conflicts of interest. To perform a different role, switch to a designated account below:
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
                Client Accounts (Commissions, Funds & Approves)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">{acc.balance} ETH</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Freelancers */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                Freelancer Accounts (Delivers Work & Earns Payouts)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">{acc.balance} ETH</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Arbitrators */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Arbitrator Accounts (Impartial Dispute Resolution)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <div className="text-[11px] font-mono text-slate-500">@{acc.username}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">{acc.balance} ETH</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Node State
          </button>

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
