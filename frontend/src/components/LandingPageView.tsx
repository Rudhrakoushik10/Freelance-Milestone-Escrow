import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Layers,
  ChevronDown,
  FileText,
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
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      <section className="text-center space-y-6 pt-4 sm:pt-10 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-lime-300 tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Decentralized Milestone Escrow Protocol</span>
        </div>

        <div className="space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md">
            Milestone Escrow Built for Modern Freelancing
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Protect every project with autonomous milestone contracts. Secure funds in smart contract escrow prior to commencement and release allocations smoothly upon verified deliverable approval.
          </p>

          <div className="flex items-center justify-center pt-2">
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-8 mt-6 rounded-3xl bg-slate-950/65 backdrop-blur-xl border border-emerald-500/20 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left shadow-2xl shadow-black/60">
            <div className="p-2">
              <span className="text-xs text-slate-400 block">Fund Security</span>
              <span className="text-sm font-bold text-lime-300">100% Locked Escrow</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Funds guaranteed before work starts</span>
            </div>
            <div className="p-2">
              <span className="text-xs text-slate-400 block">Milestone Releases</span>
              <span className="text-sm font-bold text-white">Phase-by-Phase</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Approved directly by the client</span>
            </div>
            <div className="p-2">
              <span className="text-xs text-slate-400 block">Fair Settlement</span>
              <span className="text-sm font-bold text-emerald-300">Resolution Center</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Neutral arbitration for disputes</span>
            </div>
            <div className="p-2">
              <span className="text-xs text-slate-400 block">User Accounts</span>
              <span className="text-sm font-bold text-white">Dedicated Roles</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Client, Freelancer & Arbitrator</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono tracking-wider text-lime-300 font-semibold">
            Platform Documentation & Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explore Dedicated Protocol Information
          </h2>
          <p className="text-sm text-slate-300">
            Learn about our autonomous workflows, enterprise capabilities, and cryptographic security architecture across dedicated pages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={onNavigateHowItWorks}
            className="group p-7 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60 space-y-4 hover:border-lime-400/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-lime-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-300 transition-colors">
                How It Works
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detailed 6-step lifecycle breakdown: contract creation, 100% upfront funding, deliverable proofs, approval release, and non-custodial pull withdrawals.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-lime-300">
              <span>View How It Works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onNavigateFeatures}
            className="group p-7 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60 space-y-4 hover:border-emerald-400/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Features & Capabilities
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous contracts, strict single-role permissioning, mathematical solvency invariants, pull-over-push accounting, and basis-point dispute resolution.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onNavigateSecurity}
            className="group p-7 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60 space-y-4 hover:border-lime-400/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-lime-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-300 transition-colors">
                Security Architecture
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Checks-Effects-Interactions (CEI) reentrancy guards, formal solvency proofs, threat model mitigations, and non-custodial pull balances.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-lime-300">
              <span>Inspect Security</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono tracking-wider text-lime-300 font-semibold">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does the single-role architecture work?',
              a: 'Under the decentralized protocol, each wallet account is assigned permanently to exactly one role (Client, Freelancer, or Arbitrator). This eliminates role-confusion vulnerabilities and prevents clients or freelancers from self-arbitrating disputes.',
            },
            {
              q: 'How does escrow protect the freelancer?',
              a: 'Before any work begins, the client must deposit the exact total funds into the secure escrow smart contract. Freelancers can verify that funds are securely locked and waiting before starting work.',
            },
            {
              q: 'How does escrow protect the client?',
              a: 'Funds locked in escrow are only released when the client reviews and approves the submitted milestone deliverable. If a deliverable does not match agreed specifications, the client can raise a dispute for neutral arbitration.',
            },
            {
              q: 'What happens if there is a dispute regarding a milestone?',
              a: 'The client can raise a dispute on a submitted milestone from the agreement page. This routes the contested milestone to the Resolution Center, where the designated arbitrator reviews the submitted work and determines a fair basis-point split allocation.',
            },
            {
              q: 'How quickly are funds available for withdrawal once approved?',
              a: 'Instantly. Once the client approves a milestone, the escrowed amount is immediately credited to your withdrawable balance and can be pulled to your wallet with one click.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/12 overflow-hidden shadow-lg hover:border-emerald-500/35 transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-slate-100 text-sm hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-lime-300' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-950/90 to-emerald-900/80 backdrop-blur-xl border border-lime-400/30 text-white text-center space-y-6 shadow-2xl shadow-black/70">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Start Securing Your Freelance Projects
          </h2>
          <p className="text-slate-300 text-sm">
            Connect your wallet to launch milestone agreements, review submitted deliverable proofs, and release funds securely.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onConnectWallet}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-lime-400/20 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
