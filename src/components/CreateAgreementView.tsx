import React from 'react';
import { HARDHAT_ACCOUNTS, evm } from '../services/evmEngine';
import { HardhatAccount } from '../types/escrow';
import { Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';

interface CreateAgreementViewProps {
  activeAccount: HardhatAccount;
  onAgreementCreated: (address: string) => void;
  onOpenReceipt: (tx: any) => void;
}

interface MilestoneInput {
  id: string;
  title: string;
  amount: string;
  deadlineDays: number;
}

export const CreateAgreementView: React.FC<CreateAgreementViewProps> = ({
  activeAccount,
  onAgreementCreated,
  onOpenReceipt,
}) => {
  const [title, setTitle] = React.useState('Full-Stack Web3 Application Development');
  const [freelancerAddress, setFreelancerAddress] = React.useState(HARDHAT_ACCOUNTS[1].address);
  const [arbitratorAddress, setArbitratorAddress] = React.useState(HARDHAT_ACCOUNTS[2].address);

  const [milestones, setMilestones] = React.useState<MilestoneInput[]>([
    {
      id: 'm-1',
      title: 'Milestone 1: Architectural System Design & Wireframes',
      amount: '0.25',
      deadlineDays: 7,
    },
    {
      id: 'm-2',
      title: 'Milestone 2: Application Implementation & Quality Assurance',
      amount: '0.50',
      deadlineDays: 14,
    },
    {
      id: 'm-3',
      title: 'Milestone 3: Final Production Delivery & Deployment',
      amount: '0.25',
      deadlineDays: 21,
    },
  ]);

  const [deploying, setDeploying] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<string | null>(null);

  // Compute total
  const totalEth = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  // Single-Role Rule Enforcement: Only Client accounts can commission agreements
  if (activeAccount.role !== 'client') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-200">
        <div className="p-8 rounded-2xl bg-white border border-[#111312]/15 shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#991B1B]/10 border border-[#991B1B]/30 text-[#991B1B] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#111312]">
            Client Role Required to Create Projects
          </h2>
          <p className="text-sm text-[#111312]/70 max-w-lg mx-auto leading-relaxed">
            Under the decentralized single-role architecture, each account is strictly assigned to one role. Your current account (<strong>{activeAccount.name}</strong>) is registered as a <strong>{activeAccount.roleLabel}</strong>. Only dedicated Client accounts can commission and fund escrow agreements.
          </p>
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => evm.setActiveAccount('account-0')}
              className="px-5 py-2.5 rounded-xl bg-[#111312] hover:bg-[#222624] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Switch to Client Account (Alex)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddMilestone = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);
    setSuccessInfo(null);

    setMilestones((prev) => {
      if (prev.length >= 10) {
        setErrorMsg('Maximum 10 milestones allowed per agreement');
        return prev;
      }
      const nextIdx = prev.length + 1;
      const newId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const updated = [
        ...prev,
        {
          id: newId,
          title: `Milestone ${nextIdx}: Deliverable Phase ${nextIdx}`,
          amount: '0.20',
          deadlineDays: nextIdx * 7,
        },
      ];
      setSuccessInfo(`Milestone #${nextIdx} added`);
      setTimeout(() => setSuccessInfo(null), 2500);
      return updated;
    });
  };

  const handleRemoveMilestone = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);
    setMilestones((prev) => {
      if (prev.length <= 1) {
        setErrorMsg('Agreement must have at least 1 milestone');
        return prev;
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleUpdateMilestone = (
    id: string,
    field: keyof Omit<MilestoneInput, 'id'>,
    value: any
  ) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!title.trim()) {
      setErrorMsg('Please specify an agreement title.');
      return;
    }
    if (activeAccount.address.toLowerCase() === freelancerAddress.toLowerCase()) {
      setErrorMsg('Client and Freelancer must be distinct accounts.');
      return;
    }
    if (activeAccount.address.toLowerCase() === arbitratorAddress.toLowerCase()) {
      setErrorMsg('Client and Arbitrator must be distinct accounts.');
      return;
    }
    if (freelancerAddress.toLowerCase() === arbitratorAddress.toLowerCase()) {
      setErrorMsg('Freelancer and Arbitrator must be distinct accounts.');
      return;
    }
    if (totalEth <= 0) {
      setErrorMsg('Total milestone amount must be greater than 0 ETH.');
      return;
    }

    try {
      setDeploying(true);
      const res = await evm.createAgreement({
        freelancer: freelancerAddress,
        arbitrator: arbitratorAddress,
        title,
        milestoneTitles: milestones.map((m) => m.title),
        milestoneAmounts: milestones.map((m) => m.amount),
        milestoneDeadlinesDays: milestones.map((m) => m.deadlineDays),
      });

      onOpenReceipt(res.receipt);
      onAgreementCreated(res.agreementAddress);
    } catch (err: any) {
      setErrorMsg(err.message || 'Agreement creation failed');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="p-6 rounded-2xl bg-[#111312] text-white border border-[#111312] shadow-lg flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#14532D] p-2 shrink-0 flex items-center justify-center border border-white/15">
          <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="font-display text-xl font-extrabold text-white tracking-tight">
            Create New Milestone Escrow Agreement
          </h2>
          <p className="text-xs text-white/75 mt-1">
            Deploys a dedicated milestone agreement contract. Your active account (
            <strong className="text-white font-mono">
              {activeAccount.address.substring(0, 10)}...
            </strong>
            ) will be the recorded Client.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-white border-2 border-[#991B1B] text-[#991B1B] text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Agreement Fields */}
        <div className="p-6 rounded-2xl bg-white border border-[#111312]/12 shadow-xs space-y-4">
          <h3 className="font-display text-sm font-bold text-[#111312]">
            01. Project Details & Counterparty Signers
          </h3>

          <div>
            <label className="text-xs text-[#111312] font-semibold block mb-1">
              Project / Agreement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign & Smart Contract Engineering"
              className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-3 text-xs text-[#111312] placeholder:text-[#111312]/40 focus:bg-white focus:outline-none focus:border-[#14532D]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Freelancer Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[#111312] font-semibold">
                  Freelancer Wallet Address
                </label>
                <button
                  type="button"
                  onClick={() => setFreelancerAddress(HARDHAT_ACCOUNTS[1].address)}
                  className="text-[11px] text-[#14532D] hover:underline font-bold cursor-pointer"
                >
                  Select Stark (Freelancer)
                </button>
              </div>
              <input
                type="text"
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-3 text-xs text-[#111312] font-mono focus:bg-white focus:outline-none focus:border-[#14532D]"
                required
              />
            </div>

            {/* Arbitrator Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[#111312] font-semibold">
                  Designated Arbitrator Wallet Address
                </label>
                <button
                  type="button"
                  onClick={() => setArbitratorAddress(HARDHAT_ACCOUNTS[2].address)}
                  className="text-[11px] text-[#991B1B] hover:underline font-bold cursor-pointer"
                >
                  Select Mark (Arbitrator)
                </button>
              </div>
              <input
                type="text"
                value={arbitratorAddress}
                onChange={(e) => setArbitratorAddress(e.target.value)}
                className="w-full rounded-xl bg-[#F7F8F7] border border-[#111312]/20 p-3 text-xs text-[#111312] font-mono focus:bg-white focus:outline-none focus:border-[#14532D]"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Milestones Section */}
        <div className="p-6 rounded-2xl bg-white border border-[#111312]/12 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-[#111312]">
                  02. Milestones & Payment Schedule
                </h3>
                {successInfo && (
                  <span className="text-[11px] font-bold text-[#14532D]">
                    · {successInfo}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#111312]/60">
                Define deliverables with individual funding allocations and deadlines ({milestones.length}/10 max)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111312] hover:bg-[#222624] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 space-y-3 transition-all hover:border-[#111312]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#14532D] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#111312]">
                      Milestone #{idx + 1}
                    </span>
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveMilestone(m.id, e)}
                      className="text-[#111312]/40 hover:text-[#991B1B] transition-colors p-1 cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-[11px] text-[#111312]/70 font-semibold block mb-1">
                      Deliverable Description
                    </label>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#111312]/20 p-2 text-xs text-[#111312] focus:outline-none focus:border-[#14532D]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-[#111312]/70 font-semibold block mb-1">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={m.amount}
                      onChange={(e) => handleUpdateMilestone(m.id, 'amount', e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#111312]/20 p-2 text-xs text-[#111312] font-mono focus:outline-none focus:border-[#14532D]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-[#111312]/70 font-semibold block mb-1">
                      Deadline (Days from now)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={m.deadlineDays}
                      onChange={(e) =>
                        handleUpdateMilestone(m.id, 'deadlineDays', parseInt(e.target.value) || 1)
                      }
                      className="w-full rounded-lg bg-white border border-[#111312]/20 p-2 text-xs text-[#111312] font-mono focus:outline-none focus:border-[#14532D]"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Add Milestone Button */}
            {milestones.length < 10 && (
              <button
                type="button"
                onClick={handleAddMilestone}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#14532D] hover:bg-[#14532D]/[0.06] text-[#14532D] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Milestone ({milestones.length}/10)</span>
              </button>
            )}
          </div>

          {/* Sum Total Breakdown */}
          <div className="p-4 rounded-xl bg-[#111312] text-white flex items-center justify-between text-xs">
            <span className="text-white/80 font-semibold">Total Escrow Value Required:</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {totalEth.toFixed(2)} ETH
            </span>
          </div>
        </div>

        {/* Deploy Action */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={deploying}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-display font-bold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <span>{deploying ? 'Deploying Escrow Agreement...' : 'Deploy Escrow Agreement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
