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
  Wallet,
  Clock,
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
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      tag: 'Client Action',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      num: '02',
      title: 'Contract Escrow Lockup',
      subtitle: '100% upfront funding locked on-chain',
      desc: 'Before any work begins, the client deposits the exact total agreement sum into the autonomous escrow smart contract. Funds are quarantined in contract reserves, giving the freelancer guaranteed payment protection.',
      icon: <Lock className="w-6 h-6 text-amber-600" />,
      tag: 'Escrow Guarantee',
      tagColor: 'bg-amber-100 text-amber-800',
    },
    {
      num: '03',
      title: 'Milestone Work Submission',
      subtitle: 'Deliverables with cryptographic proof',
      desc: 'The freelancer works phase-by-phase. When a milestone deliverable is ready, the freelancer submits work proofs, staging links, or repository commits on-chain with immutable audit logs.',
      icon: <Send className="w-6 h-6 text-emerald-600" />,
      tag: 'Freelancer Action',
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      num: '04',
      title: 'Client Verification & Approval',
      subtitle: 'Phase-by-phase payment release',
      desc: 'The client reviews the submitted deliverable proof. Once satisfied, the client signs a release transaction that instantly credits the milestone funds to the freelancer withdrawable balance.',
      icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
      tag: 'Client Approval',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      num: '05',
      title: 'Non-Custodial Pull Withdrawal',
      subtitle: 'Secure pull-over-push accounting',
      desc: 'Credited earnings are held safely in individual withdrawal buffers. Freelancers can pull their funds directly to their personal Ethereum wallets at any time without reentrancy risk.',
      icon: <Coins className="w-6 h-6 text-indigo-600" />,
      tag: 'Instant Payout',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      num: '06',
      title: 'Impartial Dispute Resolution',
      subtitle: 'Neutral arbitrator settlement',
      desc: 'If disagreements occur over a milestone, either party can escalate the milestone to the designated arbitrator. The arbitrator reviews submissions and executes a binding split allocation.',
      icon: <Scale className="w-6 h-6 text-rose-600" />,
      tag: 'Fair Mediation',
      tagColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-800 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Protocol Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How Milestone Escrow Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          From initial agreement terms to milestone delivery and final settlement, every step is enforced autonomously by smart contracts with zero intermediaries.
        </p>
      </div>

      {/* Process Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg shadow-indigo-950/5 space-y-4 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-indigo-600/40">
                {step.num}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${step.tagColor}`}>
                {step.tag}
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 shadow-2xs">
                {step.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* State Machine Overview Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Finite State Machine Lifecycle</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Strict Transitions Guarantee Predictable Outcomes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-300 block mb-1">State 1</span>
            <span className="text-sm font-bold text-amber-300">Pending</span>
            <p className="text-[11px] text-slate-300 mt-1">Awaiting deliverable submission</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-300 block mb-1">State 2</span>
            <span className="text-sm font-bold text-blue-300">Submitted</span>
            <p className="text-[11px] text-slate-300 mt-1">Proof uploaded for review</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-300 block mb-1">State 3</span>
            <span className="text-sm font-bold text-emerald-300">Released</span>
            <p className="text-[11px] text-slate-300 mt-1">Client approves; funds credited</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-300 block mb-1">State 4</span>
            <span className="text-sm font-bold text-rose-300">Disputed / Resolved</span>
            <p className="text-[11px] text-slate-300 mt-1">Arbitrator executes split</p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-indigo-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
