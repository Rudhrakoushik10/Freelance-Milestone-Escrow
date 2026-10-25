import React from 'react';
import { HARDHAT_ACCOUNTS } from '../services/evmEngine';
import { HardhatAccount } from '../types/escrow';
import {
  Wallet,
  Briefcase,
  Laptop,
  Scale,
  X,
  Check,
  Copy,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectAccount: (accountId: string) => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onConnectAccount,
}) => {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const clientAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'client');
  const freelancerAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'freelancer');
  const arbitratorAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'arbitrator');

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const renderAccountCard = (account: HardhatAccount) => {
    const isClient = account.role === 'client';
    const isFreelancer = account.role === 'freelancer';
    const isArbitrator = account.role === 'arbitrator';

    return (
      <div
        key={account.id}
        onClick={() => {
          onConnectAccount(account.id);
          onClose();
        }}
        className="group relative p-4 rounded-2xl bg-white/90 border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between gap-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                isClient
                  ? 'bg-blue-100 text-blue-700'
                  : isFreelancer
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isClient && <Briefcase className="w-5 h-5" />}
              {isFreelancer && <Laptop className="w-5 h-5" />}
              {isArbitrator && <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {account.name}
                </h4>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isClient
                      ? 'bg-blue-100 text-blue-800'
                      : isFreelancer
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {account.roleLabel}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">@{account.username}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Balance</span>
            <span className="text-xs font-mono font-bold text-slate-900">{account.balance} ETH</span>
          </div>
        </div>

        {/* Address and Connect Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <span>{account.address.substring(0, 10)}...{account.address.substring(34)}</span>
            <button
              onClick={(e) => handleCopy(account.address, e)}
              className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors cursor-pointer"
              title="Copy Address"
            >
              {copiedAddress === account.address ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          <button
            onClick={() => {
              onConnectAccount(account.id);
              onClose();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Connect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-50/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-white/90 border-b border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Connect Your Wallet
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  Single-Role Enforced
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an authorized account below to connect to the decentralized milestone escrow platform.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable Accounts List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Client Accounts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Client Accounts (Commission & Fund Agreements)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {clientAccounts.length} Accounts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clientAccounts.map(renderAccountCard)}
            </div>
          </section>

          {/* Freelancer Accounts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Freelancer Accounts (Submit Deliverables & Withdraw)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {freelancerAccounts.length} Accounts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {freelancerAccounts.map(renderAccountCard)}
            </div>
          </section>

          {/* Arbitrator Accounts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Arbitrator Accounts (Neutral Dispute Mediation)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {arbitratorAccounts.length} Accounts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {arbitratorAccounts.map(renderAccountCard)}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Non-custodial cryptographic access. Private keys remain secure on-chain.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
