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
      icon: <FileText className="w-6 h-6 text-[#111312]" />,
      tag: 'Client Action',
      tagColor: 'bg-[#111312] text-white',
    },
    {
      num: '02',
      title: 'Contract Escrow Lockup',
      subtitle: '100% upfront funding locked on-chain',
      desc: 'Before any work begins, the client deposits the exact total agreement sum into the autonomous escrow smart contract. Funds are quarantined in contract reserves, giving the freelancer guaranteed payment protection.',
      icon: <Lock className="w-6 h-6 text-[#14532D]" />,
      tag: 'Escrow Guarantee',
      tagColor: 'bg-[#14532D] text-white',
    },
    {
      num: '03',
      title: 'Milestone Work Submission',
      subtitle: 'Deliverables with cryptographic proof',
      desc: 'The freelancer works phase-by-phase. When a milestone deliverable is ready, the freelancer submits work proofs, staging links, or repository commits on-chain with immutable audit logs.',
      icon: <Send className="w-6 h-6 text-[#14532D]" />,
      tag: 'Freelancer Action',
      tagColor: 'bg-[#14532D] text-white',
    },
    {
      num: '04',
      title: 'Client Verification & Approval',
      subtitle: 'Phase-by-phase payment release',
      desc: 'The client reviews the submitted deliverable proof. Once satisfied, the client signs a release transaction that instantly credits the milestone funds to the freelancer withdrawable balance.',
      icon: <CheckCircle2 className="w-6 h-6 text-[#111312]" />,
      tag: 'Client Approval',
      tagColor: 'bg-[#111312] text-white',
    },
    {
      num: '05',
      title: 'Non-Custodial Pull Withdrawal',
      subtitle: 'Secure pull-over-push accounting',
      desc: 'Credited earnings are held safely in individual withdrawal buffers. Freelancers can pull their funds directly to their personal Ethereum wallets at any time without reentrancy risk.',
      icon: <Coins className="w-6 h-6 text-[#14532D]" />,
      tag: 'Instant Payout',
      tagColor: 'bg-[#14532D] text-white',
    },
    {
      num: '06',
      title: 'Impartial Dispute Resolution',
      subtitle: 'Neutral arbitrator settlement',
      desc: 'If disagreements occur over a milestone, the client can escalate the milestone to the designated arbitrator. The arbitrator reviews submissions and executes a binding split allocation.',
      icon: <Scale className="w-6 h-6 text-[#991B1B]" />,
      tag: 'Fair Mediation',
      tagColor: 'bg-[#991B1B] text-white',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111312] text-white text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Protocol Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111312] tracking-tight font-display">
          How Milestone Escrow Works
        </h1>
        <p className="text-base sm:text-lg text-[#111312]/70 leading-relaxed">
          From initial agreement terms to milestone delivery and final settlement, every step is enforced autonomously by smart contracts with zero intermediaries.
        </p>
      </div>

      {/* Process Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-6 rounded-3xl bg-white border border-[#111312]/12 shadow-sm space-y-4 hover:border-[#14532D] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-[#14532D]">
                {step.num}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${step.tagColor}`}>
                {step.tag}
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-[#F7F8F7] border border-[#111312]/12 shrink-0">
                {step.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#111312] font-display">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-[#111312]/60">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#111312]/75 leading-relaxed pt-1">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* State Machine Overview Banner */}
      <div className="p-8 rounded-3xl bg-[#111312] text-white shadow-xl border border-white/10 space-y-6">
        <div className="flex items-center gap-2 text-[#22C55E] text-xs font-bold uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Finite State Machine Lifecycle</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
          Strict Transitions Guarantee Predictable Outcomes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-[#1A1D1B] border border-white/10">
            <span className="text-xs text-white/50 block mb-1 font-mono">State 1</span>
            <span className="text-sm font-bold text-white font-display">Pending</span>
            <p className="text-[11px] text-white/70 mt-1">Awaiting deliverable submission</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#1A1D1B] border border-white/10">
            <span className="text-xs text-white/50 block mb-1 font-mono">State 2</span>
            <span className="text-sm font-bold text-white font-display">Submitted</span>
            <p className="text-[11px] text-white/70 mt-1">Proof uploaded for review</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#14532D] border border-white/15">
            <span className="text-xs text-white/70 block mb-1 font-mono">State 3</span>
            <span className="text-sm font-bold text-white font-display">Released</span>
            <p className="text-[11px] text-white/90 mt-1">Client approves; funds credited</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#991B1B] border border-white/15">
            <span className="text-xs text-white/70 block mb-1 font-mono">State 4</span>
            <span className="text-sm font-bold text-white font-display">Disputed / Resolved</span>
            <p className="text-[11px] text-white/90 mt-1">Arbitrator executes split</p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
