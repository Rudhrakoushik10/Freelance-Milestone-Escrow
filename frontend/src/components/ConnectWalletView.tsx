import React from 'react';
import { HARDHAT_ACCOUNTS, evm } from '../services/evmEngine';
import { HardhatAccount } from '../types/escrow';
import { Wallet, Briefcase, Laptop, Scale, ArrowRight, ArrowLeft, Check, Copy, ShieldCheck } from 'lucide-react';

interface ConnectWalletViewProps {
  onConnectAccount: (accountId: string) => void;
  onCancel?: () => void;
}

export const ConnectWalletView: React.FC<ConnectWalletViewProps> = ({
  onConnectAccount,
  onCancel,
}) => {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

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
        onClick={() => onConnectAccount(account.id)}
        className="group relative p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
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
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
            <span className="text-xs text-slate-400 block">Balance</span>
            <span className="text-sm font-mono font-bold text-slate-900">{account.balance} ETH</span>
          </div>
        </div>

        {/* Address and Quick Copy */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <span>{account.address.substring(0, 10)}...{account.address.substring(34)}</span>
            <button
              onClick={(e) => handleCopy(account.address, e)}
              className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
              title="Copy Address"
            >
              {copiedAddress === account.address ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={() => onConnectAccount(account.id)}
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
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Connect Your Wallet
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select an account below to connect to the decentralized milestone escrow platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Single-Role Enforced Architecture</span>
        </div>
      </div>

      {/* Accounts List Section */}
      <div className="space-y-8">
        {/* Client Accounts */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Client Accounts (Commission & Fund Escrow)
            </h2>
            <span className="text-xs text-slate-400 font-mono ml-auto">
              {clientAccounts.length} Available
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientAccounts.map(renderAccountCard)}
          </div>
        </section>

        {/* Freelancer Accounts */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Laptop className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Freelancer Accounts (Submit Deliverables & Earn)
            </h2>
            <span className="text-xs text-slate-400 font-mono ml-auto">
              {freelancerAccounts.length} Available
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freelancerAccounts.map(renderAccountCard)}
          </div>
        </section>

        {/* Arbitrator Accounts */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Arbitrator Accounts (Mediate & Resolve Disputes)
            </h2>
            <span className="text-xs text-slate-400 font-mono ml-auto">
              {arbitratorAccounts.length} Available
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arbitratorAccounts.map(renderAccountCard)}
          </div>
        </section>
      </div>
    </div>
  );
};
