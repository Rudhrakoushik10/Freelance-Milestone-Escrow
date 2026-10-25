import React from 'react';
import { RpcNodeStatus, TransactionRecord } from '../types/escrow';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Layers,
  Fuel,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface TransactionInspectorViewProps {
  transactions: TransactionRecord[];
  rpcStatus?: RpcNodeStatus;
  onOpenReceipt: (tx: TransactionRecord) => void;
}

export const TransactionInspectorView: React.FC<TransactionInspectorViewProps> = ({
  transactions,
  rpcStatus,
  onOpenReceipt,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'success' | 'reverted'>('all');
  const [search, setSearch] = React.useState('');
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const copyText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = transactions.filter((tx) => {
    if (filter !== 'all' && tx.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.hash.toLowerCase().includes(q) ||
        tx.action.toLowerCase().includes(q) ||
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q) ||
        (tx.contractAddress && tx.contractAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-[#111312] text-white border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1D1B] border border-white/10 p-2 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
                On-Chain Activity Log & Verifiable Escrow Ledger
              </h2>
              {rpcStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold border ${
                    rpcStatus.isNodeOnline
                      ? 'bg-[#14532D] text-white border-white/15'
                      : 'bg-[#991B1B] text-white border-white/15'
                  }`}
                >
                  {rpcStatus.isNodeOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-[#22C55E]" />
                      <span>Hardhat RPC Online · Block #{rpcStatus.latestBlock}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-white" />
                      <span>Hardhat RPC Offline (127.0.0.1:8545)</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-white/70 mt-1">
              Every transaction is mined on the local Hardhat EVM node. Click any record to inspect its block hash, calldata, and verify live via <code className="font-mono text-[#22C55E]">eth_getTransactionReceipt</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#1A1D1B] rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#111312]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === 'success'
                  ? 'bg-[#14532D] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Success ({transactions.filter((t) => t.status === 'success').length})
            </button>
            <button
              onClick={() => setFilter('reverted')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === 'reverted'
                  ? 'bg-[#991B1B] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Reverted ({transactions.filter((t) => t.status === 'reverted').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#111312]/40 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by tx hash, caller address, action, contract..."
          className="w-full rounded-xl bg-white border border-[#111312]/15 pl-11 pr-4 py-3 text-xs text-[#111312] placeholder:text-[#111312]/40 focus:outline-none focus:border-[#14532D] font-mono shadow-xs"
        />
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl bg-white border border-[#111312]/12 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#111312]/60 text-sm">
            No on-chain transactions recorded yet. Deploy or fund an agreement while connected to the Hardhat RPC server.
          </div>
        ) : (
          <div className="divide-y divide-[#111312]/10">
            {filtered.map((tx) => {
              const isSuccess = tx.status === 'success';
              return (
                <div
                  key={tx.hash}
                  onClick={() => onOpenReceipt(tx)}
                  className="p-5 hover:bg-[#F7F8F7] transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-[#14532D] shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
                      )}
                      <span className="font-mono text-sm font-bold text-[#111312]">
                        {tx.action}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${
                          isSuccess
                            ? 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/30'
                            : 'bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#111312] text-white font-mono font-bold">
                        <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                        Click to Verify via RPC
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#111312]/60">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#111312]/50" />
                        Block #{tx.blockNumber}
                      </span>
                      {tx.nonce !== undefined && (
                        <>
                          <span>·</span>
                          <span>Nonce #{tx.nonce}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-[#111312]/50" />
                        {tx.gasUsed.toLocaleString()} gas
                      </span>
                      <span>·</span>
                      <span>{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Hash & Addresses strip */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs font-mono">
                    <div className="md:col-span-5 flex items-center justify-between p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                      <div className="truncate text-[#111312]/70 text-[11px]">
                        Tx: <span className="text-[#14532D] font-semibold">{tx.hash}</span>
                      </div>
                      <button
                        onClick={(e) => copyText(tx.hash, e)}
                        className="p-1 text-[#111312]/50 hover:text-[#111312] cursor-pointer"
                        title="Copy Hash"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="w-3 h-3 text-[#14532D]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="md:col-span-4 p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 truncate text-[11px] text-[#111312]/70">
                      From: <span className="text-[#111312] font-semibold">{tx.from}</span>
                    </div>

                    <div className="md:col-span-3 p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 truncate text-[11px] text-[#111312]/70">
                      To: <span className="text-[#111312] font-semibold">{tx.to}</span>
                    </div>
                  </div>

                  {/* Revert error message if reverted */}
                  {!isSuccess && tx.revertReason && (
                    <div className="p-2.5 rounded-xl bg-[#991B1B]/10 border border-[#991B1B]/30 text-[#991B1B] text-xs font-mono">
                      Revert Reason: {tx.revertReason}
                    </div>
                  )}

                  {/* Decoded ABI Events Preview */}
                  {tx.events && tx.events.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-[#111312]/60 font-medium">Emitted Events:</span>
                      {tx.events.map((ev, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/25 font-mono font-bold"
                        >
                          {ev.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
