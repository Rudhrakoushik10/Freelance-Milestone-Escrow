import React from 'react';
import { TransactionRecord } from '../types/escrow';
import { CheckCircle2, XCircle, Copy, ExternalLink, X } from 'lucide-react';

interface TransactionReceiptModalProps {
  receipt: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!receipt) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(receipt.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = receipt.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/90 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 p-1 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {isSuccess ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isSuccess ? 'Transaction Mined Successfully' : 'Transaction Reverted on EVM'}
              </h3>
              <p className="text-xs text-slate-500">
                Action: <span className="font-mono text-indigo-700 font-semibold">{receipt.action}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Revert reason alert if failed */}
          {!isSuccess && receipt.revertReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono shadow-xs">
              <span className="font-bold">EVM Revert Error: </span>
              {receipt.revertReason}
            </div>
          )}

          {/* Core Receipt Parameters */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Receipt Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {receipt.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Mined in Block</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                #{receipt.blockNumber}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Gas Used</span>
              <span className="font-mono font-medium text-slate-800 tabular-nums">
                {receipt.gasUsed.toLocaleString()} units (~{(receipt.gasUsed * 0.00000002).toFixed(6)} ETH)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Value Transferred</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {receipt.value}
              </span>
            </div>
          </div>

          {/* Hash & Addresses */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Transaction Hash (Keccak-256)</span>
                <button
                  onClick={copyHash}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-slate-800 break-all select-all text-[11px] font-medium">
                {receipt.hash}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">From (Caller)</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block font-medium" title={receipt.from}>
                  {receipt.from}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">To (Target Contract)</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block font-medium" title={receipt.to}>
                  {receipt.to}
                </span>
              </div>
            </div>

            {receipt.contractAddress && (
              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-indigo-800 block text-[11px] font-medium">
                  Deployed Escrow Contract Address:
                </span>
                <span className="font-mono text-indigo-950 font-semibold text-xs break-all block">
                  {receipt.contractAddress}
                </span>
              </div>
            )}
          </div>

          {/* Decoded Logs & ABI Events */}
          {receipt.events && receipt.events.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Emitted Smart Contract Events ({receipt.events.length})
              </span>
              <div className="space-y-2">
                {receipt.events.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                  >
                    <div className="text-indigo-700 font-bold mb-1 flex items-center justify-between">
                      <span>event {ev.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">log #{i}</span>
                    </div>
                    <pre className="text-[11px] text-slate-800 whitespace-pre-wrap overflow-x-auto bg-white p-2.5 rounded border border-slate-200">
                      {JSON.stringify(ev.args, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Chain ID 31337 · Local EVM Runtime
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors shadow-xs"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
