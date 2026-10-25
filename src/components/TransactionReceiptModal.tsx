import React, { useEffect, useState } from 'react';
import { TransactionRecord } from '../types/escrow';
import { web3Service, LiveReceiptVerification } from '../services/web3Service';
import {
  CheckCircle2,
  XCircle,
  Copy,
  X,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Terminal,
} from 'lucide-react';

interface TransactionReceiptModalProps {
  receipt: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<LiveReceiptVerification | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    if (receipt?.hash) {
      handleVerifyOnChain(receipt.hash);
    } else {
      setVerification(null);
    }
  }, [receipt?.hash]);

  if (!receipt) return null;

  const copyValue = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyOnChain = async (hash: string) => {
    setVerifying(true);
    try {
      const res = await web3Service.verifyTransactionOnChain(hash);
      setVerification(res);
    } finally {
      setVerifying(false);
    }
  };

  const isSuccess = receipt.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111312]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-[#111312]/15 shadow-2xl overflow-hidden text-[#111312]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111312] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A1D1B] border border-white/10 p-1 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {isSuccess ? (
              <div className="w-8 h-8 rounded-full bg-[#14532D] flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#991B1B] flex items-center justify-center text-white shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-white font-display">
                {isSuccess ? 'On-Chain EVM Transaction Receipt' : 'Transaction Reverted on EVM'}
              </h3>
              <p className="text-xs text-white/70">
                Method: <span className="font-mono text-[#22C55E] font-bold">{receipt.action}</span>
                {receipt.executionSource && (
                  <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                    {receipt.executionSource === 'metamask_rpc'
                      ? 'Signed via MetaMask (Chain 31337)'
                      : 'Mined on Hardhat RPC (127.0.0.1:8545)'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[76vh] overflow-y-auto">
          {/* Live On-Chain Verification Status Box */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              verification?.verified
                ? 'bg-[#14532D]/10 border-[#14532D]/30 text-[#111312]'
                : 'bg-[#991B1B]/10 border-[#991B1B]/30 text-[#991B1B]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                {verification?.verified ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#14532D] shrink-0" />
                    <span>
                      Verified Live on Hardhat RPC ({verification.rpcUrl}) · {verification.confirmations} Confirmation(s)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0" />
                    <span>
                      {verifying
                        ? 'Querying eth_getTransactionReceipt on Hardhat RPC...'
                        : 'On-Chain RPC Verification Failed (Hardhat Server Offline or Reset)'}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {verification?.verified && verification.rawReceipt && (
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F7F8F7] border border-[#14532D]/30 text-[#14532D] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>{showRawJson ? 'Hide Raw RPC JSON' : 'View Raw RPC JSON'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleVerifyOnChain(receipt.hash)}
                  disabled={verifying}
                  className="px-2.5 py-1 rounded-lg bg-[#111312] hover:bg-[#222624] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Verifying...' : 'Verify Live via RPC'}</span>
                </button>
              </div>
            </div>

            {verification?.error && (
              <p className="text-[11px] text-[#991B1B] font-semibold">{verification.error}</p>
            )}

            {showRawJson && verification?.rawReceipt && (
              <pre className="p-3 rounded-xl bg-[#111312] text-[#22C55E] font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(verification.rawReceipt, null, 2)}
              </pre>
            )}
          </div>

          {/* Revert reason alert if failed */}
          {!isSuccess && receipt.revertReason && (
            <div className="p-3.5 rounded-xl bg-[#991B1B]/10 border border-[#991B1B]/30 text-[#991B1B] text-xs font-mono shadow-xs">
              <span className="font-bold">EVM Revert Error: </span>
              {receipt.revertReason}
            </div>
          )}

          {/* Core Receipt Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
              <span className="text-[#111312]/60 block mb-1">Receipt Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  isSuccess
                    ? 'bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/30'
                    : 'bg-[#991B1B]/10 text-[#991B1B] border border-[#991B1B]/30'
                }`}
              >
                {receipt.status} (0x1)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
              <span className="text-[#111312]/60 block mb-1">Block & Tx Index</span>
              <span className="font-mono font-bold text-[#111312] tabular-nums">
                #{receipt.blockNumber} · idx {receipt.transactionIndex ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
              <span className="text-[#111312]/60 block mb-1">Gas Used / Price</span>
              <span className="font-mono font-semibold text-[#111312] tabular-nums">
                {receipt.gasUsed.toLocaleString()}{' '}
                {receipt.effectiveGasPriceGwei ? `@ ${parseFloat(receipt.effectiveGasPriceGwei).toFixed(2)} Gwei` : 'units'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
              <span className="text-[#111312]/60 block mb-1">Value & Nonce</span>
              <span className="font-mono font-bold text-[#111312] tabular-nums">
                {receipt.value} {receipt.nonce !== undefined ? `· Nonce #${receipt.nonce}` : ''}
              </span>
            </div>
          </div>

          {/* Hash, Block Hash & Addresses */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
              <div className="flex items-center justify-between text-[#111312]/60 mb-1">
                <span>Transaction Hash (Original Hardhat Keccak-256)</span>
                <button
                  onClick={() => copyValue('txHash', receipt.hash)}
                  className="flex items-center gap-1 text-[#14532D] hover:text-[#166534] font-bold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === 'txHash' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-[#111312] break-all select-all text-[11px] font-semibold">
                {receipt.hash}
              </div>
            </div>

            {(receipt.blockHash || verification?.blockHash) && (
              <div className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                <div className="flex items-center justify-between text-[#111312]/60 mb-1">
                  <span>Block Hash (Mined Block Header Hash)</span>
                  <button
                    onClick={() =>
                      copyValue('blockHash', (receipt.blockHash || verification?.blockHash)!)
                    }
                    className="flex items-center gap-1 text-[#14532D] hover:text-[#166534] font-bold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedField === 'blockHash' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-[#111312] break-all select-all text-[11px]">
                  {receipt.blockHash || verification?.blockHash}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                <span className="text-[#111312]/60 block text-[11px]">From (Signer Wallet)</span>
                <span className="font-mono text-[#111312] text-[11px] truncate block font-semibold" title={receipt.from}>
                  {receipt.from}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                <span className="text-[#111312]/60 block text-[11px]">To (Target Smart Contract)</span>
                <span className="font-mono text-[#111312] text-[11px] truncate block font-semibold" title={receipt.to}>
                  {receipt.to}
                </span>
              </div>
            </div>

            {receipt.contractAddress && (
              <div className="p-3 rounded-xl bg-[#14532D]/10 border border-[#14532D]/30 flex items-center justify-between">
                <div>
                  <span className="text-[#14532D] block text-[11px] font-bold">
                    Deployed FreelanceMilestoneEscrow Contract Address:
                  </span>
                  <span className="font-mono text-[#111312] font-bold text-xs break-all block">
                    {receipt.contractAddress}
                  </span>
                </div>
                <button
                  onClick={() => copyValue('contractAddr', receipt.contractAddress!)}
                  className="text-[#14532D] hover:text-[#166534] text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#14532D]/30 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedField === 'contractAddr' ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {receipt.calldata && (
              <div className="p-2.5 rounded-xl bg-[#F7F8F7] border border-[#111312]/12">
                <span className="text-[#111312]/60 block text-[11px] mb-1">
                  ABI-Encoded Input Calldata (ethers.Interface)
                </span>
                <div className="font-mono text-[10px] text-[#111312]/80 break-all max-h-16 overflow-y-auto bg-white p-2 rounded-lg border border-[#111312]/12">
                  {receipt.calldata}
                </div>
              </div>
            )}
          </div>

          {/* Decoded Logs & ABI Events */}
          {receipt.events && receipt.events.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#111312] block font-display">
                Decoded Smart Contract Event Logs ({receipt.events.length})
              </span>
              <div className="space-y-2">
                {receipt.events.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F7F8F7] border border-[#111312]/12 font-mono text-xs"
                  >
                    <div className="text-[#14532D] font-bold mb-1 flex items-center justify-between">
                      <span>event {ev.name}</span>
                      <span className="text-[10px] text-[#111312]/50 font-normal">log #{i}</span>
                    </div>
                    <pre className="text-[11px] text-[#111312] whitespace-pre-wrap overflow-x-auto bg-white p-2.5 rounded-lg border border-[#111312]/12">
                      {JSON.stringify(ev.args, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#111312]/12 bg-[#F7F8F7] flex items-center justify-between text-xs">
          <span className="text-[#111312]/60 font-medium font-mono">
            Chain ID 31337 · Hardhat RPC (http://127.0.0.1:8545)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] font-bold text-white transition-colors shadow-xs cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
