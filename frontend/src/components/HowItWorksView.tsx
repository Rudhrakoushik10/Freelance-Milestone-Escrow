import React from 'react';
import {
  FileText,
  Lock,
  Send,
  CheckCircle2,
  Coins,
  Scale,
  ShieldCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface HowItWorksViewProps {
  onConnectWallet: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onConnectWallet }) => {
  const steps = [
    {
      num: '01',
      title: 'Agreement Commissioning',
      subtitle: 'Client creates milestone deliverables',
      desc: 'The client drafts an agreement specifying deliverables, individual milestone allocations (in ETH), submission deadlines, and designated counterparty wallet addresses (freelancer and neutral arbitrator).',
      icon: <FileText className="w-6 h-6 text-lime-300" />,
      tag: 'Client Action',
    },
    {
      num: '02',
      title: 'Contract Escrow Lockup',
      subtitle: '100% upfront funding locked on-chain',
      desc: 'Before any work begins, the client deposits the exact total agreement sum into the autonomous escrow smart contract. Funds are quarantined in contract reserves, giving the freelancer guaranteed payment protection.',
      icon: <Lock className="w-6 h-6 text-amber-300" />,
      tag: 'Escrow Guarantee',
    },
    {
      num: '03',
      title: 'Milestone Work Submission',
      subtitle: 'Deliverables with cryptographic proof',
      desc: 'The freelancer works phase-by-phase. When a milestone deliverable is ready, the freelancer submits work proofs, staging links, or repository commits on-chain with immutable audit logs.',
      icon: <Send className="w-6 h-6 text-emerald-400" />,
      tag: 'Freelancer Action',
    },
    {
      num: '04',
      title: 'Client Verification & Approval',
      subtitle: 'Phase-by-phase payment release',
      desc: 'The client reviews the submitted deliverable proof. Once satisfied, the client signs a release transaction that instantly credits the milestone funds to the freelancer withdrawable balance.',
      icon: <CheckCircle2 className="w-6 h-6 text-lime-300" />,
      tag: 'Client Approval',
    },
    {
      num: '05',
      title: 'Non-Custodial Pull Withdrawal',
      subtitle: 'Secure pull-over-push accounting',
      desc: 'Credited earnings are held safely in individual withdrawal buffers. Freelancers can pull their funds directly to their personal Ethereum wallets at any time without reentrancy risk.',
      icon: <Coins className="w-6 h-6 text-emerald-300" />,
      tag: 'Instant Payout',
    },
    {
      num: '06',
      title: 'Impartial Dispute Resolution',
      subtitle: 'Neutral arbitrator settlement',
      desc: 'If disagreements occur over a submitted milestone, the client can escalate the milestone to the designated arbitrator. The arbitrator reviews submissions and executes a binding basis-point split allocation.',
      icon: <Scale className="w-6 h-6 text-amber-400" />,
      tag: 'Fair Mediation',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12 animate-in fade-in duration-200">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-lime-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protocol Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How Milestone Escrow Works
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          From initial agreement terms to milestone delivery and final settlement, every step is enforced autonomously by smart contracts with zero intermediaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-6 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60 space-y-4 hover:border-lime-400/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-lime-400/60 tabular-nums">
                {step.num}.
              </span>
              <span className="text-xs font-mono text-slate-400">
                {step.tag}
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 shrink-0">
                {step.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-lime-400/30 text-white shadow-2xl shadow-black/70 space-y-6">
        <div className="flex items-center gap-2 text-lime-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Finite State Machine Lifecycle</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Strict Transitions Guarantee Predictable Outcomes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">State 1</span>
            <span className="text-sm font-bold text-amber-300">Pending</span>
            <p className="text-[11px] text-slate-300 mt-1">Awaiting deliverable submission</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">State 2</span>
            <span className="text-sm font-bold text-blue-300">Submitted</span>
            <p className="text-[11px] text-slate-300 mt-1">Proof uploaded for review</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">State 3</span>
            <span className="text-sm font-bold text-emerald-300">Released</span>
            <p className="text-[11px] text-slate-300 mt-1">Client approves; funds credited</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">State 4</span>
            <span className="text-sm font-bold text-rose-300">Disputed / Resolved</span>
            <p className="text-[11px] text-slate-300 mt-1">Arbitrator executes split</p>
          </div>
        </div>

        <div className="pt-2 text-center">
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
