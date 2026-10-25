import React from 'react';
import { Agreement, HardhatAccount } from '../types/escrow';
import { evm } from '../services/evmEngine';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  User,
  DollarSign,
  Info,
} from 'lucide-react';

interface ResolutionCenterViewProps {
  agreements: Agreement[];
  activeAccount: HardhatAccount;
  onSelectAgreement: (address: string) => void;
  onOpenReceipt: (tx: any) => void;
}

export const ResolutionCenterView: React.FC<ResolutionCenterViewProps> = ({
  agreements,
  activeAccount,
  onSelectAgreement,
  onOpenReceipt,
}) => {
  const [selectedMilestoneKey, setSelectedMilestoneKey] = React.useState<{
    agreementAddress: string;
    milestoneIndex: number;
  } | null>(null);
  const [disputeBps, setDisputeBps] = React.useState<number>(6000); // 60% default
  const [actionLoading, setActionLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Gather all disputed milestones across agreements
  const disputedItems: {
    agreement: Agreement;
    milestoneIndex: number;
    milestone: Agreement['milestones'][0];
  }[] = [];

  const resolvedItems: {
    agreement: Agreement;
    milestoneIndex: number;
    milestone: Agreement['milestones'][0];
  }[] = [];

  for (const agr of agreements) {
    for (const m of agr.milestones) {
      if (m.state === 'Disputed') {
        disputedItems.push({
          agreement: agr,
          milestoneIndex: m.index,
          milestone: m,
        });
      } else if (m.state === 'Resolved') {
        resolvedItems.push({
          agreement: agr,
          milestoneIndex: m.index,
          milestone: m,
        });
      }
    }
  }

  const handleResolve = async () => {
    if (!selectedMilestoneKey) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const tx = await evm.resolveDispute(
        selectedMilestoneKey.agreementAddress,
        selectedMilestoneKey.milestoneIndex,
        disputeBps
      );
      setSelectedMilestoneKey(null);
      onOpenReceipt(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Dispute resolution failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-700 font-bold bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/60">
                Resolution Center
              </span>
              <span className="text-xs text-slate-500">
                Fair & Transparent Mediation
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Dispute Resolution & Escrow Mediation
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
              When work expectations diverge, our escrow protocol enables independent arbitrators to review deliverable proofs and apportion escrowed funds fairly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-right shadow-xs">
            <div className="text-xs text-slate-500">Open Disputes</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {disputedItems.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-right shadow-xs">
            <div className="text-xs text-slate-500">Resolved Cases</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {resolvedItems.length}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Disputed Milestones Section */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Active Disputes Needing Settlement</h3>
            <p className="text-xs text-slate-500">
              Only the assigned arbitrator for each contract can submit the final allocation
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            {disputedItems.length} Pending
          </span>
        </div>

        {disputedItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Open Disputes</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All freelance project milestones are proceeding smoothly. If a milestone deliverable is contested in an agreement, it will appear here for mediation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {disputedItems.map(({ agreement, milestoneIndex, milestone }) => {
              const isArbitrator =
                activeAccount.address.toLowerCase() === agreement.arbitrator.toLowerCase();
              const isClient =
                activeAccount.address.toLowerCase() === agreement.client.toLowerCase();
              const isFreelancer =
                activeAccount.address.toLowerCase() === agreement.freelancer.toLowerCase();

              return (
                <div key={`${agreement.address}-${milestoneIndex}`} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Milestone #{milestoneIndex + 1}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {milestone.title}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded border uppercase font-mono font-semibold bg-rose-50 text-rose-700 border-rose-200">
                          Disputed
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Agreement: <strong className="text-slate-800">{agreement.title}</strong>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold font-mono text-slate-900">
                        {milestone.amount} ETH
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Locked in Escrow
                      </span>
                    </div>
                  </div>

                  {/* Submission Proof / Deliverable Note */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Freelancer's Submitted Deliverable / Work Note:
                    </div>
                    <p className="text-slate-800 italic">
                      {milestone.submissionNote || 'No deliverable note was provided with this submission.'}
                    </p>
                  </div>

                  {/* Parties & Role Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Client</span>
                      <span className="font-mono text-slate-800 font-medium truncate block">
                        {agreement.client.substring(0, 10)}...{agreement.client.substring(34)}
                      </span>
                      {isClient && (
                        <span className="text-[10px] text-blue-600 font-bold mt-0.5 block">
                          (Your Account)
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Freelancer</span>
                      <span className="font-mono text-slate-800 font-medium truncate block">
                        {agreement.freelancer.substring(0, 10)}...{agreement.freelancer.substring(34)}
                      </span>
                      {isFreelancer && (
                        <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                          (Your Account)
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Assigned Arbitrator</span>
                      <span className="font-mono text-slate-800 font-medium truncate block">
                        {agreement.arbitrator.substring(0, 10)}...{agreement.arbitrator.substring(34)}
                      </span>
                      {isArbitrator && (
                        <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
                          (You are the Arbitrator)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onSelectAgreement(agreement.address)}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center gap-1"
                    >
                      View Agreement Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {isArbitrator ? (
                      <button
                        onClick={() => {
                          setSelectedMilestoneKey({
                            agreementAddress: agreement.address,
                            milestoneIndex,
                          });
                          setDisputeBps(6000);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <Scale className="w-4 h-4" />
                        Resolve Dispute as Arbitrator
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Waiting for assigned arbitrator ({agreement.arbitrator.substring(0, 8)}...) to mediate
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Disputes Archive */}
      {resolvedItems.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Resolved Cases History</h3>
            <p className="text-xs text-slate-500">
              Completed arbitrations with finalized escrow payouts and client refunds
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {resolvedItems.map(({ agreement, milestoneIndex, milestone }) => (
              <div key={`${agreement.address}-${milestoneIndex}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      Milestone #{milestoneIndex + 1}
                    </span>
                    <span className="font-bold text-slate-900">{milestone.title}</span>
                    <span className="px-2 py-0.5 rounded border uppercase font-mono font-semibold bg-purple-50 text-purple-700 border-purple-200">
                      Settled
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Agreement: {agreement.title}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] text-emerald-700 block">Freelancer Payout</span>
                    <span className="font-mono font-bold text-slate-900">{milestone.freelancerShare} ETH</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-[11px] text-blue-700 block">Client Refund</span>
                    <span className="font-mono font-bold text-slate-900">{milestone.clientRefund} ETH</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedMilestoneKey !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-700">
              <Scale className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Arbitrator Settlement Console
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Adjust the slider to apportion the escrowed milestone funds between the freelancer and the client based on your review of the work deliverable.
            </p>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Freelancer Share:</span>
                <span className="font-mono text-emerald-700 font-bold text-sm">
                  {(disputeBps / 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={disputeBps}
                onChange={(e) => setDisputeBps(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>0% (Full Refund to Client)</span>
                <span>50% (Equal Split)</span>
                <span>100% (Full Payout to Freelancer)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedMilestoneKey(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
