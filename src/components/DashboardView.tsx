import React, { useState } from 'react';
import { Agreement, HardhatAccount, NotificationRecord } from '../types/escrow';
import { evm } from '../services/evmEngine';
import { NotificationCenter } from './NotificationCenter';
import {
  ShieldAlert,
  Coins,
  Lock,
  ArrowUpRight,
  PlusCircle,
  Briefcase,
  Laptop,
  AlertTriangle,
  Scale,
  ArrowDownLeft,
  CheckCircle2,
  FileCheck,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  agreements: Agreement[];
  activeAccount: HardhatAccount;
  viewMode?: 'dashboard' | 'projects' | 'submissions' | 'earnings';
  onSelectAgreement: (address: string) => void;
  onNavigateCreate: () => void;
  onNavigateDisputes: () => void;
  onOpenReceipt: (tx: any) => void;
  onOpenWallet: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  agreements,
  activeAccount,
  viewMode = 'dashboard',
  onSelectAgreement,
  onNavigateCreate,
  onNavigateDisputes,
  onOpenReceipt,
  onOpenWallet,
}) => {
  const [withdrawing, setWithdrawing] = useState(false);
  const notifications: NotificationRecord[] = evm.getNotifications(activeAccount.address);

  // Aggregate stats
  const totalVolume = agreements.reduce(
    (acc, a) => acc + parseFloat(a.totalRequired),
    0
  );
  const totalReserved = agreements.reduce(
    (acc, a) => acc + parseFloat(a.totalReserved),
    0
  );

  // User's total withdrawable credits across all agreements
  let userWithdrawableTotal = 0;
  for (const agr of agreements) {
    const credit = evm.getWithdrawable(agr.address, activeAccount.address);
    userWithdrawableTotal += parseFloat(credit.eth);
  }

  // Active disputes count
  let activeDisputesCount = 0;
  for (const agr of agreements) {
    for (const m of agr.milestones) {
      if (m.state === 'Disputed') activeDisputesCount++;
    }
  }

  // Filter agreements by active account's dedicated single role
  const roleAgreements = agreements.filter((agr) => {
    if (activeAccount.role === 'client') {
      return agr.client.toLowerCase() === activeAccount.address.toLowerCase();
    }
    if (activeAccount.role === 'freelancer') {
      return agr.freelancer.toLowerCase() === activeAccount.address.toLowerCase();
    }
    if (activeAccount.role === 'arbitrator') {
      return agr.arbitrator.toLowerCase() === activeAccount.address.toLowerCase();
    }
    return true;
  });

  // Further filter if viewMode is submissions
  const displayedAgreements = roleAgreements.filter((agr) => {
    if (viewMode === 'submissions') {
      return agr.milestones.some((m) => m.state === 'Pending' || m.state === 'Submitted');
    }
    return true;
  });

  // Client-specific metrics
  const clientAgreementsCount = roleAgreements.length;
  const clientFundedEth = roleAgreements.reduce(
    (sum, a) => sum + (a.agreementState === 'Active' ? parseFloat(a.totalReserved) : 0),
    0
  );
  const clientPendingSubmissions = roleAgreements.reduce(
    (sum, a) => sum + a.milestones.filter((m) => m.state === 'Submitted').length,
    0
  );

  // Freelancer-specific metrics
  const freelancerPendingMilestones = roleAgreements.reduce(
    (sum, a) => sum + a.milestones.filter((m) => m.state === 'Pending' || m.state === 'Submitted').length,
    0
  );
  const freelancerCompletedMilestones = roleAgreements.reduce(
    (sum, a) => sum + a.milestones.filter((m) => m.state === 'Released').length,
    0
  );

  const handleWithdrawAll = async (agrAddress: string) => {
    try {
      setWithdrawing(true);
      const tx = await evm.withdraw(agrAddress);
      onOpenReceipt(tx);
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Unfunded':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* Prominent Single-Role Workspace Banner */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 p-5 sm:p-6 shadow-xl shadow-indigo-950/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl p-2 shrink-0 flex items-center justify-center shadow-md ${
              activeAccount.role === 'client'
                ? 'bg-blue-600 text-white'
                : activeAccount.role === 'freelancer'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}>
              {activeAccount.role === 'client' && <Briefcase className="w-6 h-6" />}
              {activeAccount.role === 'freelancer' && <Laptop className="w-6 h-6" />}
              {activeAccount.role === 'arbitrator' && <Scale className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{activeAccount.name}</span>
                <span className="text-[10px] font-mono text-slate-400">@{activeAccount.username}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeAccount.role === 'client'
                    ? 'bg-blue-100 text-blue-800'
                    : activeAccount.role === 'freelancer'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Single-Role: {activeAccount.roleLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {activeAccount.role === 'client' && (
                  viewMode === 'projects' ? 'Client: My Commissioned Projects' : 'Client Escrow Dashboard'
                )}
                {activeAccount.role === 'freelancer' && (
                  viewMode === 'projects'
                    ? 'Freelancer: My Assigned Projects'
                    : viewMode === 'submissions'
                    ? 'Milestone Deliverable Submissions'
                    : viewMode === 'earnings'
                    ? 'Freelancer Earnings & Payouts'
                    : 'Freelancer Escrow Dashboard'
                )}
                {activeAccount.role === 'arbitrator' && 'Arbitrator Dispute Desk'}
              </h2>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2">
            {activeAccount.role === 'client' && (
              <button
                onClick={onNavigateCreate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Project</span>
              </button>
            )}

            {activeAccount.role === 'freelancer' && userWithdrawableTotal > 0 && (
              <button
                onClick={onOpenWallet}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Coins className="w-4 h-4" />
                <span>Withdraw {userWithdrawableTotal.toFixed(2)} ETH</span>
              </button>
            )}

            <button
              onClick={onOpenWallet}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              <span>Wallet: {activeAccount.balance} ETH</span>
            </button>
          </div>
        </div>

        {/* Informative Guidance Strip */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          activeAccount.role === 'client'
            ? 'bg-blue-50/80 border-blue-200 text-blue-950'
            : activeAccount.role === 'freelancer'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="space-y-0.5">
            <span className="font-bold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4" />
              {activeAccount.role === 'client' && 'Client Role Permissions'}
              {activeAccount.role === 'freelancer' && 'Freelancer Role Permissions'}
              {activeAccount.role === 'arbitrator' && 'Arbitrator Role Permissions'}
            </span>
            <p className="opacity-90">
              {activeAccount.role === 'client' &&
                'Authorized to create milestone contracts, lock ETH into smart contract escrow, review submitted work proofs, and approve payment releases.'}
              {activeAccount.role === 'freelancer' &&
                'Authorized to accept escrow projects, submit deliverable proofs with repository notes, and pull approved payouts directly to your wallet.'}
              {activeAccount.role === 'arbitrator' &&
                'Impartial dispute mediator. Analyzes contested milestones and executes binding split settlements.'}
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium opacity-80 shrink-0">
            One Account = One Role Enforced
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeAccount.role === 'client' ? (
          <>
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Commissioned Projects</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {clientAgreementsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Active Client Escrows
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Locked in Escrow</span>
                <Lock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-900 tabular-nums">
                {clientFundedEth.toFixed(2)} <span className="text-xs font-normal text-slate-500">ETH</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Secured for milestone milestones
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Deliverables Awaiting Review</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
                {clientPendingSubmissions}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Submitted by hired freelancers
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Active Disputes</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {activeDisputesCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Escalated to Resolution Center
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Assigned Projects</span>
                <Laptop className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {roleAgreements.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Contracts with your address
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Withdrawable Earnings</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {userWithdrawableTotal.toFixed(2)} <span className="text-xs font-normal text-slate-500">ETH</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {userWithdrawableTotal > 0 ? 'Ready for immediate pull' : 'No pending release'}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Pending Deliverables</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-blue-800 tabular-nums">
                {freelancerPendingMilestones}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Phases in progress or review
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span>Completed & Approved</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {freelancerCompletedMilestones}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Successful milestone payouts
              </div>
            </div>
          </>
        )}
      </div>

      {/* Prominent Earnings Card when viewMode is earnings or withdrawable > 0 */}
      {(viewMode === 'earnings' || (activeAccount.role === 'freelancer' && userWithdrawableTotal > 0)) && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Direct Withdrawable Balance (Pull-Over-Push)
            </span>
            <div className="text-3xl font-extrabold font-mono">
              {userWithdrawableTotal.toFixed(2)} ETH
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              In accordance with smart contract security best practices, funds from approved milestones are held in your dedicated withdrawable credit buffer. Pull funds safely to your wallet at any time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {roleAgreements
              .filter((a) => parseFloat(evm.getWithdrawable(a.address, activeAccount.address).eth) > 0)
              .map((a) => (
                <button
                  key={a.address}
                  onClick={() => handleWithdrawAll(a.address)}
                  disabled={withdrawing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Withdraw {evm.getWithdrawable(a.address, activeAccount.address).eth} ETH</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Real-Time Notification Center Alert Feed */}
      <NotificationCenter
        notifications={notifications}
        activeAccount={activeAccount}
        onSelectAgreement={onSelectAgreement}
      />

      {/* Agreements List for Active Role */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activeAccount.role === 'client' && 'My Commissioned Projects'}
              {activeAccount.role === 'freelancer' && (
                viewMode === 'submissions' ? 'Projects Awaiting Deliverable Submissions' : 'My Assigned Projects'
              )}
              {activeAccount.role === 'arbitrator' && 'Assigned Escrow Agreements'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeAccount.role === 'client' && 'Agreements created and funded by your Client account'}
              {activeAccount.role === 'freelancer' && 'Agreements assigned to your Freelancer account'}
              {activeAccount.role === 'arbitrator' && 'Escrow contracts under your arbitration guardianship'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Showing {displayedAgreements.length} project(s)</span>
          </div>
        </div>

        {displayedAgreements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
            <p className="font-bold text-slate-800 text-base">
              No agreements found for this single-role view
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {activeAccount.role === 'client' &&
                'You have not created any escrow projects yet. Click "+ Create Project" above to launch a milestone contract.'}
              {activeAccount.role === 'freelancer' &&
                'No contracts currently assign this account as Freelancer. To commission work as Client, switch to a Client account in the top menu.'}
              {activeAccount.role === 'arbitrator' &&
                'No dispute cases currently assigned to your address.'}
            </p>
            {activeAccount.role === 'client' && (
              <button
                onClick={onNavigateCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Project
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedAgreements.map((agr) => {
              const releasedCount = agr.milestones.filter((m) => m.state === 'Released').length;
              const disputedCount = agr.milestones.filter((m) => m.state === 'Disputed').length;
              const pendingCount = agr.milestones.filter((m) => m.state === 'Pending').length;
              const submittedCount = agr.milestones.filter((m) => m.state === 'Submitted').length;

              const userCredit = evm.getWithdrawable(agr.address, activeAccount.address);
              const hasWithdrawable = parseFloat(userCredit.eth) > 0;

              return (
                <div
                  key={agr.address}
                  className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                        onClick={() => onSelectAgreement(agr.address)}
                      >
                        {agr.title}
                      </h4>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border uppercase font-mono font-semibold ${getStatusBadge(
                          agr.agreementState
                        )}`}
                      >
                        {agr.agreementState}
                      </span>

                      {/* Single Role Identity Tag */}
                      {activeAccount.role === 'client' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-blue-600" />
                          Client Account
                        </span>
                      )}
                      {activeAccount.role === 'freelancer' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                          <Laptop className="w-3 h-3 text-emerald-600" />
                          Freelancer Account
                        </span>
                      )}
                      {activeAccount.role === 'arbitrator' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-amber-600" />
                          Neutral Arbitrator
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-mono">
                      <span>Contract: <strong className="text-slate-700 select-all">{agr.address.substring(0, 10)}...{agr.address.substring(34)}</strong></span>
                      <span>·</span>
                      <span>Client: <strong className="text-slate-700">{agr.client.substring(0, 6)}...{agr.client.substring(38)}</strong></span>
                      <span>·</span>
                      <span>Freelancer: <strong className="text-slate-700">{agr.freelancer.substring(0, 6)}...{agr.freelancer.substring(38)}</strong></span>
                    </div>

                    {/* Milestones status breakdown */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500">Milestones ({agr.milestones.length}):</span>
                      {releasedCount > 0 && (
                        <span className="text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {releasedCount} Released
                        </span>
                      )}
                      {submittedCount > 0 && (
                        <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                          {submittedCount} Submitted
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="text-[11px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {pendingCount} Pending
                        </span>
                      )}
                      {disputedCount > 0 && (
                        <span className="text-[11px] text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                          {disputedCount} Disputed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial & Action Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        {agr.totalRequired} ETH
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Reserved: {agr.totalReserved} ETH
                      </div>
                      {hasWithdrawable && (
                        <div className="text-xs text-emerald-700 font-mono font-bold mt-0.5">
                          Withdrawable: {userCredit.eth} ETH
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {hasWithdrawable && (
                        <button
                          onClick={() => handleWithdrawAll(agr.address)}
                          disabled={withdrawing}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Withdraw {userCredit.eth} ETH
                        </button>
                      )}
                      <button
                        onClick={() => onSelectAgreement(agr.address)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
                      >
                        Open Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
