import React, { useEffect, useState } from 'react';
import { NotificationRecord } from '../types/escrow';
import { evm } from '../services/evmEngine';
import {
  Coins,
  CheckCircle2,
  ShieldAlert,
  Upload,
  Scale,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
  Bell,
  ArrowDownLeft,
} from 'lucide-react';

interface NotificationToastProps {
  onSelectAgreement: (contractAddress: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectAgreement }) => {
  const [toast, setToast] = useState<NotificationRecord | null>(evm.getLatestToast());
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = evm.subscribe(() => {
      const latest = evm.getLatestToast();
      if (latest && latest !== toast) {
        setToast(latest);
        setIsVisible(true);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!toast || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    evm.clearLatestToast();
  };

  const handleAction = () => {
    if (toast.contractAddress) {
      onSelectAgreement(toast.contractAddress);
      evm.markAsRead(toast.id);
      handleDismiss();
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'funded':
        return <Coins className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'disputed':
        return <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'submitted':
        return <Upload className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'resolved':
        return <Scale className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'refunded':
        return <RotateCcw className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'withdrawn':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-600 shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.severity) {
      case 'success':
        return 'border-emerald-300/80 bg-emerald-50/95';
      case 'warning':
        return 'border-amber-300/80 bg-amber-50/95';
      case 'error':
        return 'border-rose-300/80 bg-rose-50/95';
      default:
        return 'border-indigo-300/80 bg-indigo-50/95';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div
        className={`p-4 rounded-2xl backdrop-blur-2xl border shadow-2xl shadow-indigo-950/20 text-slate-900 flex items-start gap-3 relative overflow-hidden transition-all ${getBorderColor()}`}
      >
        {/* Animated Top Progress Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-pulse" />

        {/* Icon */}
        <div className="p-2 rounded-xl bg-white/80 backdrop-blur-md shadow-xs border border-white/80">
          {getToastIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 truncate">{toast.title}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900/10 text-slate-700 font-bold">
              Real-Time Alert
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-snug break-words">
            {toast.message}
          </p>

          <div className="pt-2 flex items-center gap-2">
            {toast.contractAddress && (
              <button
                onClick={handleAction}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Open Agreement</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-[11px] font-medium transition-colors border border-slate-200/80"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors absolute top-3 right-3"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
