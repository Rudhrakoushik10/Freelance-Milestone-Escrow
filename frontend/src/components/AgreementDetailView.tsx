import React from 'react';
import { Agreement, HardhatAccount } from '../types/escrow';
import { evm } from '../services/evmEngine';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Scale,
  Send,
  Lock,
  ArrowDownLeft,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface AgreementDetailViewProps {
  agreement: Agreement;
  activeAccount: HardhatAccount;
  onBack: () => void;
  onOpenReceipt: (tx: any) => void;
  onNavigateInspector: () => void;
}

export const AgreementDetailView: React.FC<AgreementDetailViewProps> = ({
  agreement,
  activeAccount,
  onBack,
  onOpenReceipt,
}) => {
  const [copiedAddr, setCopiedAddr] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Modals state
  const [submitModalIndex, setSubmitModalIndex] = React.useState<number | null>(null);
  const [submissionNote, setSubmissionNote] = React.useState('');

  const [disputeModalIndex, setDisputeModalIndex] = React.useState<number | null>(null);
  const [disputeBps, setDisputeBps] = React.useState<number>(7000); // 70.00% default

  // Add Milestone Modal State
  const [showAddMilestoneModal, setShowAddMilestoneModal] = React.useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState('');
  const [confirmRefundMilestoneIndex, setConfirmRefundMilestoneIndex] = React.useState<number | null>(null);
  const [newMilestoneAmount, setNewMilestoneAmount] = React.useState('0.25');
  const [newMilestoneDays, setNewMilestoneDays] = React.useState(14);

  const copyAddress = () => {
    navigator.clipboard.writeText(agreement.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  // Participant check
  const isClient = activeAccount.address.toLowerCase() === agreement.client.toLowerCase();
  const isFreelancer = activeAccount.address.toLowerCase() === agreement.freelancer.toLowerCase();
  const isArbitrator = activeAccount.address.toLowerCase() === agreement.arbitrator.toLowerCase();
  const isUnfunded = agreement.agreementState === 'Unfunded';

  // Invariant verification
  const invariant = evm.verifyAccountingInvariant(agreement.address);
  const myCredit = evm.getWithdrawable(agreement.address, activeAccount.address);
  const contractBal = evm.getContractBalance(agreement.address);

  // --- Handlers ---

  const handleFund = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.fundAgreement(agreement.address);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Funding failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.withdraw(agreement.address);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim()) {
      setErrorMessage('Please provide a milestone deliverable title.');
      return;
    }
    const amt = parseFloat(newMilestoneAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage('Milestone amount must be greater than 0 ETH.');
      return;
    }
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.addMilestoneToAgreement(
        agreement.address,
        newMilestoneTitle.trim(),
        newMilestoneAmount,
        newMilestoneDays
      );
      setShowAddMilestoneModal(false);
      setNewMilestoneTitle('');
      setNewMilestoneAmount('0.25');
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitMilestone = async () => {
    if (submitModalIndex === null) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.submitMilestone(
        agreement.address,
        submitModalIndex,
        submissionNote
      );
      setSubmitModalIndex(null);
      setSubmissionNote('');
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMilestone = async (index: number) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.approveMilestone(agreement.address, index);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async (index: number) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.raiseDispute(agreement.address, index);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Dispute failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (disputeModalIndex === null) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.resolveDispute(
        agreement.address,
        disputeModalIndex,
        disputeBps
      );
      setDisputeModalIndex(null);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Resolution failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundMilestone = async (index: number) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      setConfirmRefundMilestoneIndex(null);
      const tx = await evm.refundMilestone(agreement.address, index);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Refund failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getMilestoneBadge = (state: string) => {
    switch (state) {
      case 'Released':
      case 'Submitted':
      case 'Resolved':
        return 'bg-[#14532D] text-white border-[#14532D]';
      case 'Disputed':
        return 'bg-[#991B1B] text-white border-[#991B1B]';
      case 'Refunded':
      case 'Pending':
      default:
        return 'bg-[#111312] text-white border-[#111312]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back button & agreement title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white border border-[#111312]/15 hover:border-[#111312] text-[#111312] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#111312] p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-xl font-extrabold text-[#111312] tracking-tight">
                {agreement.title}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded uppercase font-mono font-bold bg-[#14532D] text-white">
                {agreement.agreementState}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#111312]/60 font-mono mt-0.5">
              <span>Contract: {agreement.address}</span>
              <button
                onClick={copyAddress}
                className="text-[#14532D] hover:underline transition-colors inline-flex items-center gap-1 font-bold cursor-pointer"
              >
                {copiedAddr ? (
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action button if user has withdrawable credit */}
        {parseFloat(myCredit.eth) > 0 && (
          <button
            onClick={handleWithdraw}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-display font-bold text-xs transition-colors shadow-sm shrink-0 cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Pull Withdrawable Credit ({myCredit.eth} ETH)
          </button>
        )}
      </div>

      {/* Error banner if an operation reverts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-white border-2 border-[#991B1B] text-[#991B1B] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
            <span className="font-mono font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#991B1B] hover:underline text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Breakdown & Invariant Guarantee Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#111312]/12 shadow-xs">
          <span className="text-xs text-[#111312]/60 block mb-1">Contract ETH Balance</span>
          <div className="text-xl font-bold font-mono text-[#111312] tabular-nums">
            {contractBal.eth}{' '}
            <span className="text-xs text-[#111312]/60 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-[#111312]/55">Total held in escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#111312]/12 shadow-xs">
          <span className="text-xs text-[#111312]/60 block mb-1">Total Reserved</span>
          <div className="text-xl font-bold font-mono text-[#111312] tabular-nums">
            {agreement.totalReserved}{' '}
            <span className="text-xs text-[#111312]/60 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-[#111312]/55">Locked for active milestones</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#111312]/12 shadow-xs">
          <span className="text-xs text-[#111312]/60 block mb-1">Credited Balances</span>
          <div className="text-xl font-bold font-mono text-[#14532D] tabular-nums">
            {agreement.totalCredited}{' '}
            <span className="text-xs text-[#111312]/60 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-[#111312]/55">
            Withdrawn: {agreement.totalWithdrawn} ETH
          </span>
        </div>

        {/* Escrow Financial Health Check */}
        <div className="p-5 rounded-2xl bg-[#111312] text-white border border-[#111312] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/70">Fund Security</span>
              {invariant.holds ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-white font-bold bg-[#14532D] px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Backed
                </span>
              ) : (
                <span className="text-[11px] text-white font-bold bg-[#991B1B] px-2 py-0.5 rounded">
                  Mismatch
                </span>
              )}
            </div>
            <div className="text-xs text-white font-semibold mt-1">
              Milestone Escrow Health: Fully Reserved
            </div>
          </div>
          <div className="text-[10px] text-white/60 mt-2 pt-2 border-t border-white/10">
            Escrow balance covers all active milestones and payouts.
          </div>
        </div>
      </div>

      {/* Participants & Role Status */}
      <div className="rounded-2xl bg-white border border-[#111312]/12 p-5 shadow-xs">
        <h3 className="text-xs uppercase font-mono tracking-wider text-[#111312]/60 font-bold mb-3">
          Agreement Role Signers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`p-4 rounded-xl border text-xs ${
              isClient
                ? 'bg-[#111312] text-white border-[#111312]'
                : 'bg-[#F7F8F7] text-[#111312] border-[#111312]/12'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Client (Alex)</span>
              {isClient && (
                <span className="text-[10px] bg-white text-[#111312] px-1.5 py-0.5 rounded font-mono font-bold">
                  You
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] truncate select-all opacity-90">
              {agreement.client}
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              Funds escrow, reviews work, approves or raises disputes
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              isFreelancer
                ? 'bg-[#14532D] text-white border-[#14532D]'
                : 'bg-[#F7F8F7] text-[#111312] border-[#111312]/12'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Freelancer (Stark)</span>
              {isFreelancer && (
                <span className="text-[10px] bg-white text-[#14532D] px-1.5 py-0.5 rounded font-mono font-bold">
                  You
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] truncate select-all opacity-90">
              {agreement.freelancer}
            </div>
            <div className="text-[11px] opacity-75 mt-1">
              Submits milestone deliverables, withdraws released credits
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              isArbitrator
                ? 'bg-[#991B1B] text-white border-[#991B1B]'
                : 'bg-[#F7F8F7] text-[#111312] border-[#111312]/12'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Designated Arbitrator (Mark)</span>
              {isArbitrator && (
                <span className="text-[10px] bg-white text-[#991B1B] px-1.5 py-0.5 rounded font-mono font-bold">
                  You
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] truncate select-all opacity-90">
              {agreement.arbitrator}
            </div>
            <div className="text-[11px] opacity-75 mt-1">
              Resolves disputed milestones via basis points
            </div>
          </div>
        </div>
      </div>

      {/* Funding Action if Unfunded */}
      {agreement.agreementState === 'Unfunded' && (
        <div className="p-6 rounded-2xl bg-[#111312] text-white border border-[#111312] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-white text-sm font-display font-bold mb-1">
              <AlertOctagon className="w-4 h-4 text-[#22C55E]" />
              Agreement Created — Requires Exact Client Deposit
            </div>
            <p className="text-xs text-white/75 max-w-xl leading-relaxed">
              The smart contract requires the exact sum of all milestones (
              <strong className="text-white font-mono">{agreement.totalRequired} ETH</strong>).
              Depositing exact funds transitions the agreement to{' '}
              <strong className="text-[#22C55E]">Active</strong> and locks funds in{' '}
              <strong className="text-white font-mono">totalReserved</strong>.
            </p>
          </div>
          {isClient ? (
            <button
              onClick={handleFund}
              disabled={actionLoading}
              className="px-5 py-3 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-display font-bold text-xs transition-colors border border-white/15 shrink-0 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              Deposit Exact Funding ({agreement.totalRequired} ETH)
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5 text-white shrink-0" />
              <span>
                Awaiting Client (Alex) to deposit exact escrow funding ({agreement.totalRequired} ETH)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Milestones Flow Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#111312]">
              Milestone State Machine Lifecycle
            </h3>
            <span className="text-xs text-[#111312]/60 font-mono">
              {agreement.milestones.length} Milestones · Total: {agreement.totalRequired} ETH
            </span>
          </div>
          {isUnfunded && isClient && (
            <button
              onClick={() => {
                setNewMilestoneTitle(
                  `Milestone ${agreement.milestones.length + 1}: Final Project Deliverable`
                );
                setNewMilestoneAmount('0.20');
                setNewMilestoneDays(14);
                setShowAddMilestoneModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {agreement.milestones.map((milestone) => {
            const isPending = milestone.state === 'Pending';
            const isSubmitted = milestone.state === 'Submitted';
            const isDisputed = milestone.state === 'Disputed';
            const isReleased = milestone.state === 'Released';
            const isResolved = milestone.state === 'Resolved';
            const isRefunded = milestone.state === 'Refunded';

            return (
              <div
                key={milestone.index}
                className="p-5 rounded-2xl bg-white border border-[#111312]/12 hover:border-[#111312]/30 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Milestone Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-[#111312] text-white flex items-center justify-center font-mono text-xs font-bold">
                        {milestone.index + 1}
                      </span>
                      <h4 className="font-display text-sm font-bold text-[#111312]">
                        {milestone.title}
                      </h4>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded border uppercase font-mono font-bold ${getMilestoneBadge(
                          milestone.state
                        )}`}
                      >
                        {milestone.state}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#111312]/60 font-mono">
                      <span>
                        Amount: <strong className="text-[#111312]">{milestone.amount} ETH</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Deadline:{' '}
                        <strong className="text-[#111312]">
                          {new Date(milestone.deadline * 1000).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>

                    {/* Submission Note if submitted/disputed */}
                    {milestone.submissionNote && (
                      <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 text-xs">
                        <span className="text-[#111312]/60 font-bold block mb-0.5">
                          Freelancer Submission Proof / Note:
                        </span>
                        <p className="text-[#111312] italic font-sans">
                          {milestone.submissionNote}
                        </p>
                      </div>
                    )}

                    {/* Arbitration outcome summary if resolved */}
                    {isResolved && (
                      <div className="p-3 rounded-xl bg-[#14532D]/[0.06] border border-[#14532D]/30 text-xs font-mono">
                        <div className="text-[#14532D] font-bold mb-1">
                          Dispute Resolution Applied:
                        </div>
                        <div className="text-[#111312]">
                          Freelancer Credit: <strong>{milestone.freelancerShare} ETH</strong> ·
                          Client Refund: <strong>{milestone.clientRefund} ETH</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Role-Gated Milestone Actions & Waiting Badges */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Unfunded Agreement Waiting Badge on Milestones */}
                    {agreement.agreementState === 'Unfunded' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F7] border border-[#111312]/15 text-[#111312] text-xs font-mono font-medium">
                        <Lock className="w-3.5 h-3.5 text-[#111312]" />
                        {isClient
                          ? 'Deposit Escrow Funding Above to Activate'
                          : 'Awaiting Client (Alex) Escrow Deposit'}
                      </span>
                    )}

                    {/* PENDING MILESTONE (Active Agreement) */}
                    {isPending && agreement.agreementState === 'Active' && (
                      <>
                        {isFreelancer ? (
                          <button
                            onClick={() => {
                              setSubmitModalIndex(milestone.index);
                              setSubmissionNote('');
                            }}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit Work
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F7] border border-[#111312]/15 text-[#111312] text-xs font-mono font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#14532D]" />
                            Awaiting Freelancer (Stark) Submission
                          </span>
                        )}

                        {/* Client-only secondary option: Refund Unstarted */}
                        {isClient &&
                          (confirmRefundMilestoneIndex === milestone.index ? (
                            <div className="flex items-center gap-1.5 bg-[#991B1B]/10 border border-[#991B1B]/30 p-1 rounded-lg">
                              <span className="text-[11px] text-[#991B1B] font-bold px-1">
                                Refund milestone?
                              </span>
                              <button
                                onClick={() => handleRefundMilestone(milestone.index)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded bg-[#991B1B] hover:bg-[#B91C1C] text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmRefundMilestoneIndex(null)}
                                className="px-1.5 py-1 rounded text-[#111312]/70 hover:text-[#111312] text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRefundMilestoneIndex(milestone.index)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F8F7] text-[#111312] border border-[#111312]/20 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Refund Unstarted
                            </button>
                          ))}
                      </>
                    )}

                    {/* SUBMITTED MILESTONE (Active Agreement) */}
                    {isSubmitted && agreement.agreementState === 'Active' && (
                      <>
                        {isClient ? (
                          <>
                            <button
                              onClick={() => handleApproveMilestone(milestone.index)}
                              disabled={actionLoading}
                              className="px-3.5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve & Credit Freelancer
                            </button>
                            <button
                              onClick={() => handleRaiseDispute(milestone.index)}
                              disabled={actionLoading}
                              className="px-3.5 py-2 rounded-xl bg-[#991B1B] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                              Raise Dispute
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14532D]/[0.08] border border-[#14532D]/30 text-[#14532D] text-xs font-mono font-semibold">
                            <Clock className="w-3.5 h-3.5 text-[#14532D]" />
                            Awaiting Client (Alex) Review & Approval
                          </span>
                        )}
                      </>
                    )}

                    {/* DISPUTED MILESTONE (Active Agreement) */}
                    {isDisputed && agreement.agreementState === 'Active' && (
                      <>
                        {isArbitrator ? (
                          <button
                            onClick={() => {
                              setDisputeModalIndex(milestone.index);
                              setDisputeBps(7000);
                            }}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-[#991B1B] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            Resolve Dispute
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#991B1B]/[0.08] border border-[#991B1B]/30 text-[#991B1B] text-xs font-mono font-semibold">
                            <Scale className="w-3.5 h-3.5 text-[#991B1B]" />
                            Awaiting Arbitrator (Mark) Ruling
                          </span>
                        )}
                      </>
                    )}

                    {/* TERMINAL MILESTONE STATES */}
                    {isReleased && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14532D]/[0.08] border border-[#14532D]/30 text-[#14532D] text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#14532D]" />
                        Approved & Credited to Freelancer
                      </span>
                    )}

                    {isResolved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111312] text-white text-xs font-mono font-bold">
                        <Scale className="w-3.5 h-3.5 text-white" />
                        Arbitrated Settlement Finalized
                      </span>
                    )}

                    {isRefunded && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F7] border border-[#111312]/20 text-[#111312] text-xs font-mono font-bold">
                        <RotateCcw className="w-3.5 h-3.5 text-[#111312]" />
                        Refunded to Client
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Milestone Work Modal */}
      {submitModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111312]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#111312]/20 p-6 space-y-4 text-[#111312] shadow-2xl">
            <h3 className="font-display text-base font-bold text-[#111312]">
              Submit Milestone #{submitModalIndex + 1}
            </h3>
            <p className="text-xs text-[#111312]/70">
              Provide notes, links, or documentation of your completed milestone deliverable for client review and payment release.
            </p>
            <div>
              <label className="text-xs text-[#111312] font-semibold block mb-1">
                Submission Note / Deliverable Proof (Max 256 chars)
              </label>
              <textarea
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                placeholder="e.g. Frontend components finished and pushed to staging repository..."
                rows={3}
                className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-3 text-xs text-[#111312] placeholder:text-[#111312]/40 focus:outline-none focus:border-[#14532D]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmitModalIndex(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#111312]/70 hover:text-[#111312] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMilestone}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arbitrator Dispute Resolution Modal */}
      {disputeModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111312]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#111312]/20 p-6 space-y-4 text-[#111312] shadow-2xl">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <Scale className="w-5 h-5" />
              <h3 className="font-display text-base font-bold text-[#111312]">
                Arbitrator Dispute Resolution Console
              </h3>
            </div>
            <p className="text-xs text-[#111312]/70">
              Allocate the disputed milestone amount ({agreement.milestones[disputeModalIndex]?.amount} ETH) between the freelancer and the client based on your review of the work deliverable.
            </p>

            <div className="space-y-2 p-4 rounded-xl bg-[#F7F8F7] border border-[#111312]/15">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#111312]/70 font-semibold">Freelancer Share:</span>
                <span className="font-mono text-[#14532D] font-bold tabular-nums">
                  {(disputeBps / 100).toFixed(2)}% ({disputeBps} bps)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={disputeBps}
                onChange={(e) => setDisputeBps(parseInt(e.target.value))}
                className="w-full accent-[#14532D] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-[#111312]/60 font-mono">
                <span>0% (Full Refund)</span>
                <span>50% (Equal Split)</span>
                <span>100% (Full Payout)</span>
              </div>
            </div>

            {/* Live Split Calculation */}
            {(() => {
              const m = agreement.milestones[disputeModalIndex];
              const totalWei = m ? m.amountWei : 0n;
              const fShareWei = (totalWei * BigInt(disputeBps)) / 10000n;
              const cRefundWei = totalWei - fShareWei;
              return (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#14532D]/[0.08] border border-[#14532D]/30">
                    <span className="text-[#14532D] block mb-0.5 font-bold">Freelancer Credit</span>
                    <span className="text-[#111312] text-sm font-bold">
                      {(Number(fShareWei) / 1e18).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F8F7] border border-[#111312]/15">
                    <span className="text-[#111312] block mb-0.5 font-bold">Client Refund</span>
                    <span className="text-[#111312] text-sm font-bold">
                      {(Number(cRefundWei) / 1e18).toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDisputeModalIndex(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#111312]/70 hover:text-[#111312] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Broadcast Resolution On-Chain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Add Milestone Modal (for Unfunded agreements) */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111312]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#111312]/20 p-6 space-y-4 text-[#111312] shadow-2xl">
            <div className="flex items-center gap-2 text-[#14532D]">
              <Plus className="w-5 h-5" />
              <h3 className="font-display text-base font-bold text-[#111312]">
                Add Milestone to Escrow Agreement
              </h3>
            </div>
            <p className="text-xs text-[#111312]/70">
              Append a new milestone deliverable prior to locking funds in escrow. Once exact funding is deposited, milestones become immutable.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#111312] font-semibold block mb-1">
                  Deliverable Title / Scope
                </label>
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Milestone 4: Production Deployment & QA"
                  className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-2.5 text-xs text-[#111312] focus:bg-white focus:outline-none focus:border-[#14532D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#111312] font-semibold block mb-1">
                    Allocation Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                    className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-2.5 text-xs text-[#111312] font-mono focus:bg-white focus:outline-none focus:border-[#14532D]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#111312] font-semibold block mb-1">
                    Deadline (Days from now)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMilestoneDays}
                    onChange={(e) => setNewMilestoneDays(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-2.5 text-xs text-[#111312] font-mono focus:bg-white focus:outline-none focus:border-[#14532D]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#111312]/10">
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#111312]/70 hover:text-[#111312] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Appending...' : 'Append Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
