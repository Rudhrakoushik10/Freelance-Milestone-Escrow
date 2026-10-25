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
      <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="Platform Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                On-Chain Activity Log & Verifiable Escrow Ledger
              </h2>
              {rpcStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                    rpcStatus.isNodeOnline
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {rpcStatus.isNodeOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-600" />
                      <span>Hardhat RPC Online · Block #{rpcStatus.latestBlock}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-600" />
                      <span>Hardhat RPC Offline (127.0.0.1:8545)</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Every transaction is mined on the local Hardhat EVM node. Click any record to inspect its block hash, calldata, and verify live via <code className="font-mono">eth_getTransactionReceipt</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/80 text-xs shadow-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'success'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Success ({transactions.filter((t) => t.status === 'success').length})
            </button>
            <button
              onClick={() => setFilter('reverted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'reverted'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reverted ({transactions.filter((t) => t.status === 'reverted').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by tx hash, caller address, action, contract..."
          className="w-full rounded-xl bg-white/70 backdrop-blur-md border border-white/80 pl-11 pr-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono shadow-xs"
        />
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No on-chain transactions recorded yet. Deploy or fund an agreement while connected to the Hardhat RPC server.
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50">
            {filtered.map((tx) => {
              const isSuccess = tx.status === 'success';
              return (
                <div
                  key={tx.hash}
                  onClick={() => onOpenReceipt(tx)}
                  className="p-5 hover:bg-white/50 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {tx.action}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold border ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Click to Verify via RPC
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
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
                        <Fuel className="w-3.5 h-3.5 text-slate-400" />
                        {tx.gasUsed.toLocaleString()} gas
                      </span>
                      <span>·</span>
                      <span>{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Hash & Addresses strip */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs font-mono">
                    <div className="md:col-span-5 flex items-center justify-between p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200/70">
                      <div className="truncate text-slate-700 text-[11px]">
                        Tx: <span className="text-indigo-700 font-medium">{tx.hash}</span>
                      </div>
                      <button
                        onClick={(e) => copyText(tx.hash, e)}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Copy Hash"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="md:col-span-4 p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200/70 truncate text-[11px] text-slate-600">
                      From: <span className="text-slate-900 font-medium">{tx.from}</span>
                    </div>

                    <div className="md:col-span-3 p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200/70 truncate text-[11px] text-slate-600">
                      To: <span className="text-slate-900 font-medium">{tx.to}</span>
                    </div>
                  </div>

                  {/* Revert error message if reverted */}
                  {!isSuccess && tx.revertReason && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
                      Revert Reason: {tx.revertReason}
                    </div>
                  )}

                  {/* Decoded ABI Events Preview */}
                  {tx.events && tx.events.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500">Emitted Events:</span>
                      {tx.events.map((ev, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-medium"
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
