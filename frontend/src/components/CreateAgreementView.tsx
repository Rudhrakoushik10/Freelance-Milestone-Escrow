import React from 'react';
import { HARDHAT_ACCOUNTS, evm } from '../services/evmEngine';
import { HardhatAccount } from '../types/escrow';
import { Plus, Trash2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
    { id: 'm-1', title: 'Milestone 1: Architectural System Design & Wireframes', amount: '0.25', deadlineDays: 7 },
    { id: 'm-2', title: 'Milestone 2: Application Implementation & Quality Assurance', amount: '0.50', deadlineDays: 14 },
    { id: 'm-3', title: 'Milestone 3: Final Production Delivery & Deployment', amount: '0.25', deadlineDays: 21 },
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
        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Client Role Required to Create Projects
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Under the decentralized single-role architecture, each account is strictly assigned to one role. Your current account (<strong>{activeAccount.name}</strong>) is registered as a <strong>{activeAccount.roleLabel}</strong>. Only dedicated Client accounts can commission and fund escrow agreements.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => evm.setActiveAccount('account-0')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Switch to Client Account (Alex Rivera)
            </button>
            <button
              onClick={() => evm.setActiveAccount('account-4')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
            >
              Switch to Client Account (Sophia Chen)
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

  const handleUpdateMilestone = (id: string, field: keyof Omit<MilestoneInput, 'id'>, value: any) => {
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
      <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 shrink-0 flex items-center justify-center shadow-xs">
          <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Create New Milestone Escrow Agreement
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sets up a dedicated milestone agreement. Your active account (<strong className="text-slate-800 font-mono">{activeAccount.address.substring(0, 10)}...</strong>) will be the recorded Client.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Agreement Fields */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider font-mono">
            1. Project Details & Participants
          </h3>

          <div>
            <label className="text-xs text-slate-700 font-medium block mb-1">
              Project / Agreement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign & Smart Contract Engineering"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Freelancer Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-medium">
                  Freelancer Wallet Address
                </label>
                <button
                  type="button"
                  onClick={() => setFreelancerAddress(HARDHAT_ACCOUNTS[1].address)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Select Elena Vance (Freelancer)
                </button>
              </div>
              <input
                type="text"
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Arbitrator Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-medium">
                  Designated Arbitrator Wallet Address
                </label>
                <button
                  type="button"
                  onClick={() => setArbitratorAddress(HARDHAT_ACCOUNTS[2].address)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Select Marcus Thorne (Arbitrator)
                </button>
              </div>
              <input
                type="text"
                value={arbitratorAddress}
                onChange={(e) => setArbitratorAddress(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Milestones Section */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider font-mono">
                  2. Milestones & Payment Schedule
                </h3>
                {successInfo && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                    {successInfo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Define deliverables with individual funding allocations and deadlines ({milestones.length}/10 max)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 space-y-3 transition-all hover:border-indigo-100 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Milestone #{idx + 1}
                    </span>
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveMilestone(m.id, e)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Deliverable Description
                    </label>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={m.amount}
                      onChange={(e) => handleUpdateMilestone(m.id, 'amount', e.target.value)}
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Deadline (Days from now)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={m.deadlineDays}
                      onChange={(e) =>
                        handleUpdateMilestone(m.id, 'deadlineDays', parseInt(e.target.value) || 1)
                      }
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
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
                className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Milestone ({milestones.length}/10)</span>
              </button>
            )}
          </div>

          {/* Sum Total Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Total Escrow Value Required:</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {totalEth.toFixed(2)} ETH
            </span>
          </div>
        </div>

        {/* Deploy Action */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={deploying}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            <span>{deploying ? 'Creating Escrow Agreement...' : 'Create Escrow Agreement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
