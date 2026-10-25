import React from 'react';
import { Agreement, HardhatAccount, Milestone } from '../types/escrow';
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
  Coins,
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
  onNavigateInspector,
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Disputed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Resolved':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Refunded':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top back button & agreement title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-900 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {agreement.title}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded border uppercase font-mono font-semibold bg-indigo-50 text-indigo-700 border-indigo-200">
                {agreement.agreementState}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
              <span>Contract: {agreement.address}</span>
              <button
                onClick={copyAddress}
                className="text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center gap-1 font-medium"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action button if user has withdrawable credit */}
        {parseFloat(myCredit.eth) > 0 && (
          <button
            onClick={handleWithdraw}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Pull Withdrawable Credit ({myCredit.eth} ETH)
          </button>
        )}
      </div>

      {/* Error banner if an operation reverts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-mono">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 text-xs underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Breakdown & Invariant Guarantee Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-xs text-slate-500 block mb-1">Contract ETH Balance</span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {contractBal.eth} <span className="text-xs text-slate-500 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-slate-500">Total held in escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-xs text-slate-500 block mb-1">Total Reserved</span>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {agreement.totalReserved} <span className="text-xs text-slate-500 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-slate-500">Locked for active milestones</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-xs text-slate-500 block mb-1">Credited Balances</span>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {agreement.totalCredited} <span className="text-xs text-slate-500 font-normal">ETH</span>
          </div>
          <span className="text-[11px] text-slate-500">Withdrawn: {agreement.totalWithdrawn} ETH</span>
        </div>

        {/* Escrow Financial Health Check */}
        <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Fund Security</span>
              {invariant.holds ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Backed
                </span>
              ) : (
                <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Mismatch</span>
              )}
            </div>
            <div className="text-[11px] text-slate-700 font-medium">
              Milestone Escrow Health: Fully Reserved
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Escrow balance covers all active milestones and payouts.
          </div>
        </div>

      </div>

      {/* Participants & Role Status */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-lg shadow-indigo-950/5">
        <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold mb-3">
          Agreement Role Signers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className={`p-3.5 rounded-xl border text-xs ${isClient ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-blue-800">Client</span>
              {isClient && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">You</span>}
            </div>
            <div className="font-mono text-slate-800 text-[11px] truncate select-all">{agreement.client}</div>
            <div className="text-[11px] text-slate-500 mt-1">Funds escrow, reviews and approves work</div>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs ${isFreelancer ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-emerald-800">Freelancer</span>
              {isFreelancer && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">You</span>}
            </div>
            <div className="font-mono text-slate-800 text-[11px] truncate select-all">{agreement.freelancer}</div>
            <div className="text-[11px] text-slate-500 mt-1">Submits milestone notes, withdraws credits</div>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs ${isArbitrator ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-amber-800">Designated Arbitrator</span>
              {isArbitrator && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-medium">You</span>}
            </div>
            <div className="font-mono text-slate-800 text-[11px] truncate select-all">{agreement.arbitrator}</div>
            <div className="text-[11px] text-slate-500 mt-1">Resolves disputed milestones via basis points</div>
          </div>

        </div>
      </div>

      {/* Funding Action if Unfunded */}
      {agreement.agreementState === 'Unfunded' && (
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold mb-1">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              Agreement Created — Requires Exact Client Deposit
            </div>
            <p className="text-xs text-slate-700 max-w-xl">
              The smart contract requires the exact sum of all milestones (
              <strong className="text-slate-900 font-mono">{agreement.totalRequired} test ETH</strong>).
              Depositing exact funds transitions the agreement to <strong className="text-emerald-700">Active</strong> and locks funds in <strong className="text-amber-700">totalReserved</strong>.
            </p>
          </div>
          {isClient ? (
            <button
              onClick={handleFund}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              Deposit Exact Funding ({agreement.totalRequired} ETH)
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-mono font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Awaiting Client (Alex) to deposit exact escrow funding ({agreement.totalRequired} ETH)</span>
            </div>
          )}
        </div>
      )}

      {/* Milestones Flow Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Milestone State Machine Lifecycle</h3>
            <span className="text-xs text-slate-500 font-mono">
              {agreement.milestones.length} Milestones · Total: {agreement.totalRequired} ETH
            </span>
          </div>
          {isUnfunded && isClient && (
            <button
              onClick={() => {
                setNewMilestoneTitle(`Milestone ${agreement.milestones.length + 1}: Final Project Deliverable`);
                setNewMilestoneAmount('0.20');
                setNewMilestoneDays(14);
                setShowAddMilestoneModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
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
                className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 hover:bg-white/85 transition-all shadow-md shadow-indigo-950/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  {/* Left: Milestone Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-700">
                        {milestone.index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {milestone.title}
                      </h4>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border uppercase font-mono font-semibold ${getMilestoneBadge(
                          milestone.state
                        )}`}
                      >
                        {milestone.state}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                      <span>Amount: <strong className="text-slate-800">{milestone.amount} ETH</strong></span>
                      <span>·</span>
                      <span>Deadline: <strong className="text-slate-700">{new Date(milestone.deadline * 1000).toLocaleDateString()}</strong></span>
                    </div>

                    {/* Submission Note if submitted/disputed */}
                    {milestone.submissionNote && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-500 font-semibold block mb-0.5">Freelancer Submission Proof/Note:</span>
                        <p className="text-slate-800 italic font-sans">{milestone.submissionNote}</p>
                      </div>
                    )}

                    {/* Arbitration outcome summary if resolved */}
                    {isResolved && (
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono">
                        <div className="text-purple-800 font-semibold mb-1">Dispute Resolution Applied:</div>
                        <div className="text-slate-700">
                          Freelancer Credit: <strong>{milestone.freelancerShare} ETH</strong> · Client Refund: <strong>{milestone.clientRefund} ETH</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Role-Gated Milestone Actions & Waiting Badges */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    
                    {/* Unfunded Agreement Waiting Badge on Milestones */}
                    {agreement.agreementState === 'Unfunded' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
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
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit Work
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Awaiting Freelancer (Stark) Submission
                          </span>
                        )}

                        {/* Client-only secondary option: Refund Unstarted */}
                        {isClient && (
                          confirmRefundMilestoneIndex === milestone.index ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                              <span className="text-[11px] text-rose-700 font-medium px-1">Refund milestone?</span>
                              <button
                                onClick={() => handleRefundMilestone(milestone.index)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmRefundMilestoneIndex(null)}
                                className="px-1.5 py-1 rounded text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRefundMilestoneIndex(milestone.index)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Refund Unstarted
                            </button>
                          )
                        )}
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
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve & Credit Freelancer
                            </button>
                            <button
                              onClick={() => handleRaiseDispute(milestone.index)}
                              disabled={actionLoading}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                              Raise Dispute
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono font-medium">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
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
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            Resolve Dispute
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-medium">
                            <Scale className="w-3.5 h-3.5 text-rose-600" />
                            Awaiting Arbitrator (Mark) Ruling
                          </span>
                        )}
                      </>
                    )}

                    {/* TERMINAL MILESTONE STATES */}
                    {isReleased && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved & Credited to Freelancer
                      </span>
                    )}

                    {isResolved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono font-semibold">
                        <Scale className="w-3.5 h-3.5 text-purple-600" />
                        Arbitrated Settlement Finalized
                      </span>
                    )}

                    {isRefunded && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-semibold">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-4 text-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Submit Milestone #{submitModalIndex + 1}
            </h3>
            <p className="text-xs text-slate-600">
              Provide notes, links, or documentation of your completed milestone deliverable for client review and payment release.
            </p>
            <div>
              <label className="text-xs text-slate-700 font-medium block mb-1">
                Submission Note / Deliverable Proof (Max 256 chars)
              </label>
              <textarea
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                placeholder="e.g. Frontend components finished and pushed to staging repository..."
                rows={3}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmitModalIndex(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMilestone}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arbitrator Dispute Resolution Modal */}
      {disputeModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-700">
              <Scale className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Arbitrator Dispute Resolution Console
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Allocate the disputed milestone amount ({agreement.milestones[disputeModalIndex]?.amount} ETH) between the freelancer and the client based on your review of the work deliverable.
            </p>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Freelancer Share:</span>
                <span className="font-mono text-emerald-700 font-bold tabular-nums">
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
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
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
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 block mb-0.5 font-bold">Freelancer Credit</span>
                    <span className="text-slate-900 text-sm font-semibold">
                      {(Number(fShareWei) / 1e18).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-700 block mb-0.5 font-bold">Client Refund</span>
                    <span className="text-slate-900 text-sm font-semibold">
                      {(Number(cRefundWei) / 1e18).toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDisputeModalIndex(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs"
              >
                Broadcast Resolution On-Chain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Add Milestone Modal (for Unfunded agreements) */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-700">
              <Plus className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Add Milestone to Escrow Agreement
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Append a new milestone deliverable prior to locking funds in escrow. Once exact funding is deposited, milestones become immutable.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  Deliverable Title / Scope
                </label>
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Milestone 4: Production Deployment & QA"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">
                    Allocation Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">
                    Deadline (Days from now)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMilestoneDays}
                    onChange={(e) => setNewMilestoneDays(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
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
