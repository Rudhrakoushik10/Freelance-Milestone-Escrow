import React from 'react';
import {
  Shield,
  Coins,
  Scale,
  Bell,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

interface FeaturesViewProps {
  onConnectWallet: () => void;
}

export const FeaturesView: React.FC<FeaturesViewProps> = ({ onConnectWallet }) => {
  const featureList = [
    {
      title: 'Autonomous Milestone Smart Contracts',
      desc: 'Each agreement is deployed as an isolated, dedicated smart contract. Funds are quarantined within contract reserves and can only be transferred according to deterministic cryptographic rules.',
      icon: <Cpu className="w-6 h-6 text-[#14532D]" />,
      highlights: ['Isolated escrow instances', 'Deterministic state machines', 'No central custodian'],
    },
    {
      title: 'Strict Single-Role Architecture',
      desc: 'To prevent role manipulation and fraudulent self-dealing, each wallet is strictly bound to one role: Client, Freelancer, or Arbitrator. Multi-role impersonation is rejected at the protocol layer.',
      icon: <UserCheck className="w-6 h-6 text-[#111312]" />,
      highlights: ['No role-switching exploits', 'Clean audit trails', 'Role-based access modifiers'],
    },
    {
      title: 'Mathematical Accounting Invariant',
      desc: 'The contract continuously enforces that address(this).balance equals totalReserved plus sum of withdrawable credits. Any transaction attempting to violate this invariant reverts instantly.',
      icon: <Shield className="w-6 h-6 text-[#14532D]" />,
      highlights: ['Zero solvency deficit', 'Continuous invariant assertions', 'Formal verification design'],
    },
    {
      title: 'Pull-Over-Push Payment Pattern',
      desc: 'Following security best practices, funds are never pushed automatically to recipients. Instead, approved milestone payouts are safely recorded in personal withdrawable credit buffers for manual withdrawal.',
      icon: <Coins className="w-6 h-6 text-[#14532D]" />,
      highlights: ['Reentrancy immunity', 'Gas exhaustion defense', 'Independent user withdrawals'],
    },
    {
      title: 'Basis-Point Dispute Resolution',
      desc: 'When conflicts occur, appointed arbitrators can divide contested milestone funds with basis-point precision (down to 0.01% / 1 bps granularity), crediting the freelancer and refunding the client.',
      icon: <Scale className="w-6 h-6 text-[#991B1B]" />,
      highlights: ['Proportional settlement', 'Neutral mediation desk', 'Binding on-chain execution'],
    },
    {
      title: 'Real-Time Event Alerts & Notification Center',
      desc: 'Stay informed with instant alerts when milestones are created, funded, submitted, approved, or disputed. Never miss a project update or payment release.',
      icon: <Bell className="w-6 h-6 text-[#111312]" />,
      highlights: ['Instant UI alerts', 'Full unread counter', 'One-click transaction audit'],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#14532D] text-white text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Platform Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111312] tracking-tight font-display">
          Engineered for Escrow Integrity
        </h1>
        <p className="text-base sm:text-lg text-[#111312]/70 leading-relaxed">
          Explore the core capabilities that power transparent, secure, and trustless milestone payments for modern freelancers and clients.
        </p>
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureList.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-[#111312]/12 shadow-sm space-y-4 hover:border-[#14532D] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#F7F8F7] border border-[#111312]/12 w-fit">
                {item.icon}
              </div>
              <h3 className="text-base font-extrabold text-[#111312] font-display">
                {item.title}
              </h3>
              <p className="text-xs text-[#111312]/75 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-[#111312]/10 space-y-1.5">
              {item.highlights.map((h, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-[#111312]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-8 rounded-3xl bg-[#111312] text-white border border-white/10 shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-extrabold font-display">
          Ready to experience milestone escrow protection?
        </h2>
        <p className="text-sm text-white/70 max-w-xl mx-auto">
          Connect your wallet to launch a new milestone project as a client, or submit milestone deliverables as a freelancer.
        </p>
        <div className="pt-2">
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
