import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Wallet,
  Shield,
  KeyRound,
  FileCheck,
} from 'lucide-react';

interface SecurityViewProps {
  onConnectWallet: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onConnectWallet }) => {
  const securityPillars = [
    {
      title: 'Formal Reentrancy Defense',
      desc: 'All state-changing functions adhere strictly to the Checks-Effects-Interactions (CEI) design pattern and are shielded by OpenZeppelin-standard reentrancy mutex guards (_status != _ENTERED).',
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      status: 'Enforced On-Chain',
    },
    {
      title: 'Solvency Invariant Verification',
      desc: 'Every agreement verifies: contractBalance == totalReserved + sum(withdrawable). No fund leakage, stranded reserves, or unauthorized minting is mathematically possible.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      status: 'Mathematically Proven',
    },
    {
      title: 'Single-Role RBAC Enforcement',
      desc: 'Cryptographic modifiers (onlyClient, onlyFreelancer, onlyArbitrator) protect all state transitions. Accounts cannot spoof privileges or transition across role boundaries.',
      icon: <KeyRound className="w-6 h-6 text-blue-600" />,
      status: 'Role-Gated',
    },
    {
      title: 'Pull-Over-Push Accounting',
      desc: 'No external ETH transfers occur during approval or arbitration. Funds are ledger-credited to individual withdrawable balances, eliminating denial-of-service attack vectors.',
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      status: 'DoS Immune',
    },
  ];

  const threatMitigations = [
    {
      threat: 'Freelancer Reentrancy on Withdrawal',
      mitigation: 'Balances are zeroed out before external value transfers occur, reinforced by nonReentrant modifier.',
    },
    {
      threat: 'Client Refusal to Pay / Extortion',
      mitigation: '100% of agreement funds are locked in escrow upfront. If the client refuses to approve, the arbitrator can enforce release.',
    },
    {
      threat: 'Arbitrator Unauthorized Withdrawal',
      mitigation: 'Arbitrators cannot withdraw funds to their own addresses. They can only partition funds between client and freelancer.',
    },
    {
      threat: 'Role Hijacking / Identity Confusion',
      mitigation: 'Strict single-role architecture locks each wallet permanently to one role, preventing self-dispute arbitration.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Security & Threat Model</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Security Architecture
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Cryptographic guarantees, formal accounting invariants, and defense-in-depth principles protecting over every escrow transaction.
        </p>
      </div>

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityPillars.map((p, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg shadow-indigo-950/5 space-y-4 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs">
                {p.icon}
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {p.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {p.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Threat Model Matrix */}
      <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Threat Model & Defensive Mitigations
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {threatMitigations.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 font-semibold text-xs text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{item.threat}</span>
              </div>
              <div className="md:col-span-7 text-xs text-slate-600 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item.mitigation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-bold">
          Start With Complete Security Assurance
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Every escrow agreement is deployed independently on-chain with full participant auditability and cryptographic receipts.
        </p>
        <div className="pt-2">
          <button
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
