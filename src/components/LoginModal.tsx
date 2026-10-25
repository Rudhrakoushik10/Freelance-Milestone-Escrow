import React from 'react';
import { HARDHAT_ACCOUNTS } from '../services/evmEngine';
import { HardhatAccount } from '../types/escrow';
import { X, ArrowRight, Briefcase, Laptop, Scale, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccount: HardhatAccount;
  onSelectAccount: (id: string) => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  activeAccount,
  onSelectAccount,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const handleSignIn = (id: string) => {
    onSelectAccount(id);
    onLoginSuccess();
  };

  const clientAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'client');
  const freelancerAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'freelancer');
  const arbitratorAccounts = HARDHAT_ACCOUNTS.filter((a) => a.role === 'arbitrator');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl overflow-hidden text-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-white/50 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
              <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sign In to Non-Custodial Account
              </h3>
              <p className="text-xs text-slate-500">
                Select your dedicated single-role profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Single Role Explanation */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-indigo-900 mb-0.5">
                Strict Single-Role Architecture:
              </span>
              <p className="text-slate-600 leading-relaxed">
                Each account operates with exactly one permanent role — <strong>Client</strong>, <strong>Freelancer</strong>, or <strong>Arbitrator</strong> — with its own non-custodial wallet and on-chain permissions.
              </p>
            </div>
          </div>

          {/* Group 1: Clients */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Client Profiles (Creates Agreements & Funds Escrow)
            </div>
            {clientAccounts.map((acc) => {
              const isSelected = acc.id === activeAccount.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSignIn(acc.id)}
                  className={`w-full p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-[11px] text-blue-600 font-mono">@{acc.username}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-200 text-blue-800 font-bold px-2 py-0.2 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {acc.roleDescription || acc.roleLabel}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {acc.address.substring(0, 10)}...{acc.address.substring(34)}
                    </div>
                  </div>
                  <div className="text-right pl-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 block mb-1">
                      {acc.balance} ETH
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs ml-auto"
                    >
                      Connect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group 2: Freelancers */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" />
              Freelancer Profiles (Submits Deliverables & Withdraws Payouts)
            </div>
            {freelancerAccounts.map((acc) => {
              const isSelected = acc.id === activeAccount.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSignIn(acc.id)}
                  className={`w-full p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-mono">@{acc.username}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {acc.roleDescription || acc.roleLabel}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {acc.address.substring(0, 10)}...{acc.address.substring(34)}
                    </div>
                  </div>
                  <div className="text-right pl-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 block mb-1">
                      {acc.balance} ETH
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 group-hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs ml-auto"
                    >
                      Connect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group 3: Arbitrators */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Arbitrator Profiles (Neutral Dispute Guardianship)
            </div>
            {arbitratorAccounts.map((acc) => {
              const isSelected = acc.id === activeAccount.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSignIn(acc.id)}
                  className={`w-full p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-[11px] text-amber-600 font-mono">@{acc.username}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.2 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {acc.roleDescription || acc.roleLabel}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {acc.address.substring(0, 10)}...{acc.address.substring(34)}
                    </div>
                  </div>
                  <div className="text-right pl-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 block mb-1">
                      {acc.balance} ETH
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-amber-600 group-hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs ml-auto"
                    >
                      Connect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Non-Custodial Account Authentication</span>
          <button
            onClick={() => handleSignIn(activeAccount.id)}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 font-semibold text-white text-xs shadow-xs transition-colors"
          >
            Continue as {activeAccount.name}
          </button>
        </div>
      </div>
    </div>
  );
};
