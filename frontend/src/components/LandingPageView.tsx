import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Layers,
  ChevronDown,
  FileText,
  Scale,
  Lock,
} from 'lucide-react';

interface LandingPageViewProps {
  onConnectWallet: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateFeatures: () => void;
  onNavigateSecurity: () => void;
  onNavigateDisputes: () => void;
  onNavigateActivity: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onConnectWallet,
  onNavigateHowItWorks,
  onNavigateFeatures,
  onNavigateSecurity,
}) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Architectural High-Contrast Hero Section */}
      <section className="rounded-3xl bg-[#111312] text-white p-8 sm:p-14 lg:p-16 border border-[#111312] shadow-2xl relative overflow-hidden">
        {/* Subtle Forest Green & Crimson Red Architectural Grid Accent */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-white/80 tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Decentralized Milestone Escrow Protocol · Chain ID 31337</span>
          </div>

          <h1
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
            style={{ textWrap: 'balance' }}
          >
            Milestone Escrow Engineered for Trustless Freelancing
          </h1>

          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Protect every engagement with autonomous Solidity smart contracts. Lock 100% of project funds in escrow before work starts, release payments phase-by-phase on client approval, and settle disputes with basis-point precision.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-display font-bold text-sm transition-all border border-white/15 shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Connect Wallet & Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateHowItWorks}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F8F7] text-[#111312] font-display font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* 4-Column Architectural Metrics Strip */}
          <div className="pt-10 mt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <span className="text-xs text-white/55 font-mono block">01 · Fund Security</span>
              <span className="font-display text-base font-bold text-white block">
                100% Upfront Lockup
              </span>
              <span className="text-xs text-white/60 block">
                Escrow backed before work starts
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-white/55 font-mono block">02 · Settlements</span>
              <span className="font-display text-base font-bold text-white block">
                Pull-Over-Push
              </span>
              <span className="text-xs text-white/60 block">
                OpenZeppelin ReentrancyGuard
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-white/55 font-mono block">03 · Mediation</span>
              <span className="font-display text-base font-bold text-white block">
                Basis-Point Splits
              </span>
              <span className="text-xs text-white/60 block">
                0–10,000 bps neutral arbitration
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-white/55 font-mono block">04 · Governance</span>
              <span className="font-display text-base font-bold text-white block">
                Single-Role Wallets
              </span>
              <span className="text-xs text-white/60 block">
                Alex · Stark · Mark separation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Protocol Pages Discovery Hub */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-[#14532D]">
            Protocol Architecture & Specifications
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#111312] tracking-tight">
            Explore Dedicated Protocol Documentation
          </h2>
          <p className="text-sm text-[#111312]/70">
            Inspect our six-stage state machine lifecycle, single-role access control guarantees, and formal solvency verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: How It Works (Charcoal Accent) */}
          <div
            onClick={onNavigateHowItWorks}
            className="group p-7 rounded-2xl bg-white border border-[#111312]/15 hover:border-[#111312] shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#111312] text-white flex items-center justify-center group-hover:bg-[#14532D] transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#111312]/55">01 · Lifecycle</span>
                <h3 className="font-display text-xl font-bold text-[#111312]">
                  How It Works
                </h3>
                <p className="text-xs text-[#111312]/70 leading-relaxed">
                  Complete 6-step lifecycle breakdown: contract deployment, 100% upfront funding, deliverable proof submission, client approval, and pull withdrawals.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#111312]/10 flex items-center justify-between text-xs font-bold text-[#111312] group-hover:text-[#14532D]">
              <span>View Lifecycle Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Features (Forest Green Accent) */}
          <div
            onClick={onNavigateFeatures}
            className="group p-7 rounded-2xl bg-white border border-[#111312]/15 hover:border-[#14532D] shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#14532D] text-white flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#14532D]">02 · Capabilities</span>
                <h3 className="font-display text-xl font-bold text-[#111312]">
                  Features & Capabilities
                </h3>
                <p className="text-xs text-[#111312]/70 leading-relaxed">
                  Autonomous escrow contracts, strict single-role permissioning, mathematical solvency invariants, pull-over-push accounting, and live RPC telemetry.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#111312]/10 flex items-center justify-between text-xs font-bold text-[#14532D]">
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Security & Dispute Defense (Crimson Red Accent) */}
          <div
            onClick={onNavigateSecurity}
            className="group p-7 rounded-2xl bg-white border border-[#111312]/15 hover:border-[#991B1B] shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#991B1B] text-white flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#991B1B]">03 · Defense-in-Depth</span>
                <h3 className="font-display text-xl font-bold text-[#111312]">
                  Security & Threat Model
                </h3>
                <p className="text-xs text-[#111312]/70 leading-relaxed">
                  Checks-Effects-Interactions (CEI) reentrancy guards, formal solvency equations, role boundary enforcement, and zero-leakage dispute arbitration.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#111312]/10 flex items-center justify-between text-xs font-bold text-[#991B1B]">
              <span>Inspect Security Model</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#14532D]">
            Protocol Reference
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111312] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does the strict single-role architecture work?',
              a: 'Each wallet account is permanently bound to a single role: Client (Alex), Freelancer (Stark), or Arbitrator (Mark). Only the Freelancer can submit deliverables, only the Client can approve work or raise a dispute, and only the Arbitrator can execute a dispute split.',
            },
            {
              q: 'How does escrow protect the freelancer?',
              a: 'Before any work begins, the client must deposit 100% of the agreement ETH into the smart contract via fundAgreement(). Freelancers can verify on-chain that the full project commitment is locked and reserved.',
            },
            {
              q: 'How does escrow protect the client?',
              a: 'Funds locked in escrow are only released when the client reviews and approves a submitted milestone deliverable, or if an unstarted milestone is refunded.',
            },
            {
              q: 'What happens if a submitted milestone is disputed?',
              a: 'If the client contests a submitted deliverable via raiseDispute(), the milestone transitions to Disputed and is routed to the Resolution Center, where the designated Arbitrator (Mark) apportions the locked ETH using basis points (0 to 10,000 bps).',
            },
            {
              q: 'How quickly are funds available for withdrawal once approved?',
              a: 'Immediately in the same block. Once a milestone is approved or resolved, the payout is credited to the withdrawable mapping and can be pulled to your wallet in one click via withdraw().',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#111312]/15 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-[#111312] text-sm hover:bg-[#F7F8F7] transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#111312]/60 transition-transform shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-[#14532D]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-[#111312]/75 leading-relaxed border-t border-[#111312]/10 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Forest Green & Charcoal Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#14532D] text-white text-center space-y-6 border border-[#111312]/20 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2
            className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Start Securing Your Freelance Milestones On-Chain
          </h2>
          <p className="text-white/85 text-sm leading-relaxed">
            Connect your wallet as Client (Alex), Freelancer (Stark), or Arbitrator (Mark) to deploy agreements, submit deliverables, and verify live EVM receipts.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onConnectWallet}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#111312] hover:bg-[#222624] text-white font-display font-bold text-sm transition-all border border-white/15 shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Connect Your Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
