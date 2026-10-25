import React from 'react';
import { Agreement, HardhatAccount } from '../types/escrow';
import { evm } from '../services/evmEngine';
import {
  Scale,
  ShieldCheck,
  ArrowRight,
  FileText,
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
      <div className="p-6 rounded-3xl bg-[#111312] text-white border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#991B1B] p-2.5 shrink-0 flex items-center justify-center shadow-sm">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono tracking-wider text-white font-bold bg-[#991B1B] px-2.5 py-0.5 rounded-lg">
                Resolution Center
              </span>
              <span className="text-xs text-white/60">
                Fair & Transparent Mediation
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1.5 font-display">
              Dispute Resolution & Escrow Mediation
            </h2>
            <p className="text-xs text-white/70 max-w-2xl mt-0.5 leading-relaxed">
              When work expectations diverge, our escrow protocol enables independent arbitrators to review deliverable proofs and apportion escrowed funds fairly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#1A1D1B] border border-white/10 text-right">
            <div className="text-[11px] text-white/60 uppercase tracking-wider font-mono">Open Disputes</div>
            <div className="text-lg font-extrabold font-mono text-white tabular-nums">
              {disputedItems.length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1A1D1B] border border-white/10 text-right">
            <div className="text-[11px] text-white/60 uppercase tracking-wider font-mono">Resolved Cases</div>
            <div className="text-lg font-extrabold font-mono text-white tabular-nums">
              {resolvedItems.length}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#991B1B]/10 border border-[#991B1B]/30 text-[#991B1B] text-xs flex items-center justify-between shadow-xs">
          <span className="font-medium">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#991B1B] underline font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Disputed Milestones Section */}
      <div className="rounded-3xl bg-white border border-[#111312]/12 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#111312]/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#111312] font-display">
              Active Disputes Needing Settlement
            </h3>
            <p className="text-xs text-[#111312]/60">
              Only the assigned arbitrator for each contract can submit the final allocation
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#991B1B] bg-[#991B1B]/10 border border-[#991B1B]/30 px-2.5 py-0.5 rounded-lg">
            {disputedItems.length} Pending
          </span>
        </div>

        {disputedItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/25 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#111312] font-display">No Open Disputes</h4>
            <p className="text-xs text-[#111312]/60 max-w-md mx-auto">
              All freelance project milestones are proceeding smoothly. If a milestone deliverable is contested in an agreement, it will appear here for mediation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#111312]/10">
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
                        <span className="text-xs font-mono font-bold text-white bg-[#111312] px-2 py-0.5 rounded">
                          Milestone #{milestoneIndex + 1}
                        </span>
                        <h4 className="text-base font-bold text-[#111312] font-display">
                          {milestone.title}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded border uppercase font-mono font-bold bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/30">
                          Disputed
                        </span>
                      </div>
                      <div className="text-xs text-[#111312]/60">
                        Agreement: <strong className="text-[#111312]">{agreement.title}</strong>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold font-mono text-[#111312]">
                        {milestone.amount} ETH
                      </div>
                      <span className="text-[11px] text-[#111312]/50 font-mono">
                        Locked in Escrow
                      </span>
                    </div>
                  </div>

                  {/* Submission Proof / Deliverable Note */}
                  <div className="p-4 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 space-y-1 text-xs">
                    <div className="text-[#111312]/70 font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#14532D]" />
                      Freelancer's Submitted Deliverable / Work Note:
                    </div>
                    <p className="text-[#111312] italic">
                      {milestone.submissionNote || 'No deliverable note was provided with this submission.'}
                    </p>
                  </div>

                  {/* Parties & Role Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                      <span className="text-[#111312]/60 block mb-0.5">Client</span>
                      <span className="font-mono text-[#111312] font-semibold truncate block">
                        {agreement.client.substring(0, 10)}...{agreement.client.substring(34)}
                      </span>
                      {isClient && (
                        <span className="text-[10px] text-[#111312] font-bold mt-0.5 block">
                          (Your Account)
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                      <span className="text-[#111312]/60 block mb-0.5">Freelancer</span>
                      <span className="font-mono text-[#111312] font-semibold truncate block">
                        {agreement.freelancer.substring(0, 10)}...{agreement.freelancer.substring(34)}
                      </span>
                      {isFreelancer && (
                        <span className="text-[10px] text-[#14532D] font-bold mt-0.5 block">
                          (Your Account)
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                      <span className="text-[#111312]/60 block mb-0.5">Assigned Arbitrator</span>
                      <span className="font-mono text-[#111312] font-semibold truncate block">
                        {agreement.arbitrator.substring(0, 10)}...{agreement.arbitrator.substring(34)}
                      </span>
                      {isArbitrator && (
                        <span className="text-[10px] text-[#991B1B] font-bold mt-0.5 block">
                          (You are the Arbitrator)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onSelectAgreement(agreement.address)}
                      className="text-xs text-[#14532D] hover:text-[#166534] font-bold inline-flex items-center gap-1 cursor-pointer"
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
                        className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Scale className="w-4 h-4" />
                        Resolve Dispute as Arbitrator
                      </button>
                    ) : (
                      <span className="text-xs text-[#111312]/60 italic">
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
        <div className="rounded-3xl bg-white border border-[#111312]/12 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#111312]/10">
            <h3 className="text-base font-extrabold text-[#111312] font-display">Resolved Cases History</h3>
            <p className="text-xs text-[#111312]/60">
              Completed arbitrations with finalized escrow payouts and client refunds
            </p>
          </div>
          <div className="divide-y divide-[#111312]/10">
            {resolvedItems.map(({ agreement, milestoneIndex, milestone }) => (
              <div key={`${agreement.address}-${milestoneIndex}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white bg-[#111312] px-2 py-0.5 rounded">
                      Milestone #{milestoneIndex + 1}
                    </span>
                    <span className="font-bold text-[#111312] font-display">{milestone.title}</span>
                    <span className="px-2 py-0.5 rounded border uppercase font-mono font-bold bg-[#14532D]/10 text-[#14532D] border-[#14532D]/30">
                      Settled
                    </span>
                  </div>
                  <div className="text-[#111312]/60 mt-1">
                    Agreement: <strong className="text-[#111312]">{agreement.title}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="p-2.5 rounded-xl bg-[#14532D]/10 border border-[#14532D]/25">
                    <span className="text-[11px] text-[#14532D] font-semibold block">Freelancer Payout</span>
                    <span className="font-mono font-bold text-[#111312]">{milestone.freelancerShare} ETH</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111312]/5 border border-[#111312]/15">
                    <span className="text-[11px] text-[#111312]/70 font-semibold block">Client Refund</span>
                    <span className="font-mono font-bold text-[#111312]">{milestone.clientRefund} ETH</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedMilestoneKey !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111312]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#111312]/15 p-6 space-y-4 text-[#111312] shadow-2xl">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <Scale className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-[#111312] font-display">
                Arbitrator Settlement Console
              </h3>
            </div>
            <p className="text-xs text-[#111312]/70">
              Adjust the slider to apportion the escrowed milestone funds between the freelancer and the client based on your review of the work deliverable.
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-[#F7F8F7] border border-[#111312]/12">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#111312]/70 font-semibold">Freelancer Share:</span>
                <span className="font-mono text-[#14532D] font-bold text-sm">
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
                className="w-full accent-[#14532D] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-[#111312]/60 font-mono">
                <span>0% (Client Refund)</span>
                <span>50% (Equal Split)</span>
                <span>100% (Freelancer)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedMilestoneKey(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111312]/70 hover:text-[#111312] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs cursor-pointer"
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
