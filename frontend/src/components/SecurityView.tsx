import React from 'react';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
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
      icon: <Lock className="w-6 h-6 text-lime-300" />,
      status: 'Enforced On-Chain',
    },
    {
      title: 'Solvency Invariant Verification',
      desc: 'Every agreement verifies: contractBalance == totalReserved + sum(withdrawable). No fund leakage, stranded reserves, or unauthorized minting is mathematically possible.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      status: 'Mathematically Proven',
    },
    {
      title: 'Single-Role RBAC Enforcement',
      desc: 'Cryptographic modifiers (onlyClient, onlyFreelancer, onlyArbitrator) protect all state transitions. Accounts cannot spoof privileges or transition across role boundaries.',
      icon: <KeyRound className="w-6 h-6 text-lime-300" />,
      status: 'Role-Gated',
    },
    {
      title: 'Pull-Over-Push Accounting',
      desc: 'No external ETH transfers occur during approval or arbitration. Funds are ledger-credited to individual withdrawable balances, eliminating denial-of-service attack vectors.',
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
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
      mitigation: '100% of agreement funds are locked in escrow upfront. If a dispute is raised, the neutral arbitrator enforces a fair split.',
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
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-lime-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security & Threat Model</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Security Architecture
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Cryptographic guarantees, formal accounting invariants, and defense-in-depth principles protecting every escrow transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityPillars.map((p, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60 space-y-4 hover:border-lime-400/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/30">
                {p.icon}
              </div>
              <span className="text-xs font-mono text-lime-300">
                {p.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {p.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-slate-950/75 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/70 space-y-6">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-lime-300" />
          <h2 className="text-xl font-bold text-white">
            Threat Model & Defensive Mitigations
          </h2>
        </div>

        <div className="divide-y divide-white/10">
          {threatMitigations.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 font-semibold text-xs text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item.threat}</span>
              </div>
              <div className="md:col-span-7 text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item.mitigation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-lime-400/30 text-white shadow-2xl shadow-black/70 text-center space-y-4">
        <h2 className="text-2xl font-bold">
          Start With Complete Security Assurance
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Every escrow agreement is deployed independently on-chain with full participant auditability and cryptographic receipts.
        </p>
        <div className="pt-2">
          <button
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
