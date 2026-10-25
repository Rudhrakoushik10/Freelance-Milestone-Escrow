import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Lock,
  Layers,
  Coins,
  Scale,
  CheckCircle2,
  ChevronDown,
  Zap,
  Briefcase,
  Laptop,
  Check,
  Sparkles,
  Wallet,
  Cpu,
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
  onNavigateDisputes,
  onNavigateActivity,
}) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-10 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-xs font-semibold text-slate-700 animate-in fade-in duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Decentralized Milestone Escrow Protocol</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Milestone Escrow Built for Modern Freelancing
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Protect every project with autonomous milestone contracts. Secure funds in smart contract escrow prior to commencement and release allocations smoothly upon verified deliverable approval.
          </p>

          <div className="flex items-center justify-center pt-2">
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Platform Benefits Bar */}
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3">
              <span className="text-xs text-slate-500 block">Fund Security</span>
              <span className="text-sm font-bold text-slate-900">100% Locked Escrow</span>
              <span className="text-[11px] text-slate-400 block">Funds guaranteed before work starts</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-500 block">Milestone Releases</span>
              <span className="text-sm font-bold text-slate-900">Phase-by-Phase</span>
              <span className="text-[11px] text-slate-400 block">Approved directly by the client</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-500 block">Fair Settlement</span>
              <span className="text-sm font-bold text-slate-900">Resolution Center</span>
              <span className="text-[11px] text-slate-400 block">Neutral arbitration for disputes</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-500 block">User Accounts</span>
              <span className="text-sm font-bold text-slate-900">Dedicated Roles</span>
              <span className="text-[11px] text-slate-400 block">Client & Freelancer wallets</span>
            </div>
          </div>

        </div>
      </section>

      {/* Explore Protocol Pages Discovery Hub */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-indigo-600 font-bold">
            Platform Documentation & Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Dedicated Protocol Information
          </h2>
          <p className="text-sm text-slate-600">
            Learn about our autonomous workflows, enterprise capabilities, and cryptographic security architecture across dedicated pages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: How It Works */}
          <div
            onClick={onNavigateHowItWorks}
            className="group p-7 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-lg shadow-indigo-950/5 space-y-4 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                How It Works
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detailed 6-step lifecycle breakdown: contract creation, 100% upfront funding, deliverable proofs, approval release, and non-custodial pull withdrawals.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>View How It Works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Features */}
          <div
            onClick={onNavigateFeatures}
            className="group p-7 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-lg shadow-indigo-950/5 space-y-4 hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Features & Capabilities
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Autonomous contracts, strict single-role permissioning, mathematical solvency invariants, pull-over-push accounting, and basis-point dispute resolution.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Security */}
          <div
            onClick={onNavigateSecurity}
            className="group p-7 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-lg shadow-indigo-950/5 space-y-4 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Security Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Checks-Effects-Interactions (CEI) reentrancy guards, formal solvency proofs, threat model mitigations, and non-custodial pull balances.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Inspect Security</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-indigo-600 font-bold">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
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
              a: 'Funds locked in escrow are only released when you, the client, review and approve the submitted milestone deliverable. If a deliverable does not match agreed specifications, you can request revisions or open a dispute.',
            },
            {
              q: 'What happens if there is a dispute regarding a milestone?',
              a: 'Either party can open a dispute from the agreement page. This routes the contested milestone to the designated Resolution Center, where the chosen arbitrator reviews the submitted work and determines a fair allocation.',
            },
            {
              q: 'How quickly are funds available for withdrawal once approved?',
              a: 'Instantly. Once the client approves a milestone, the escrowed amount is immediately credited to your withdrawable balance and can be transferred to your wallet with one click.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white/65 backdrop-blur-xl border border-white/80 overflow-hidden shadow-sm hover:border-white/95 transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white text-center space-y-6 shadow-md shadow-indigo-600/20">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Start Securing Your Freelance Projects
          </h2>
          <p className="text-indigo-100 text-sm">
            Connect your wallet to launch milestone agreements, review submitted deliverable proofs, and release funds securely.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onConnectWallet}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm transition-all shadow-md hover:scale-[1.02] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-6 pb-2 border-t border-slate-200/80 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-900 p-0.5 flex items-center justify-center">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-slate-800">Freelance Milestone Escrow</span>
          <span>·</span>
          <span>Protected Milestone Agreements</span>
        </div>
        <div className="text-slate-400 text-xs">
          Autonomous smart contract escrow on Ethereum
        </div>
      </footer>

    </div>
  );
};
