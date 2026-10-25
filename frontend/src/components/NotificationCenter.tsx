import React, { useState } from 'react';
import { NotificationRecord, HardhatAccount } from '../types/escrow';
import { evm } from '../services/evmEngine';
import {
  Bell,
  Coins,
  CheckCircle2,
  ShieldAlert,
  Upload,
  Scale,
  RotateCcw,
  Sparkles,
  Check,
  Trash2,
  ExternalLink,
  Filter,
  CheckCheck,
  ArrowDownLeft,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: NotificationRecord[];
  activeAccount: HardhatAccount;
  onSelectAgreement: (address: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  activeAccount,
  onSelectAgreement,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'funded' | 'completed' | 'disputed'>('all');

  const accountNotifs = notifications.filter(
    (n) => !n.recipientAddress || n.recipientAddress.toLowerCase() === activeAccount.address.toLowerCase()
  );

  const unreadCount = accountNotifs.filter((n) => !n.read).length;

  const filteredNotifs = accountNotifs.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'funded') return n.type === 'funded';
    if (filter === 'completed') return n.type === 'completed';
    if (filter === 'disputed') return n.type === 'disputed';
    return true;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotifIcon = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'funded':
        return <Coins className="w-4 h-4 text-emerald-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'disputed':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'submitted':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <Scale className="w-4 h-4 text-amber-600" />;
      case 'refunded':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'withdrawn':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getNotifBadgeStyle = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'funded':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'disputed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'withdrawn':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg shadow-indigo-950/5 overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center relative shrink-0 shadow-xs">
            <Bell className="w-5 h-5 text-indigo-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Real-Time Escrow Activity Alerts</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200">
                Live Signal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immediate event notifications when milestones are funded, completed, or disputed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => evm.markAllAsRead(activeAccount.address)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-indigo-200/60"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-200/40 flex items-center justify-between gap-4 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium shrink-0">Filter Alerts:</span>
          
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            All ({accountNotifs.length})
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-900 font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('funded')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'funded'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Funded
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter('disputed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'disputed'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Disputed
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono shrink-0 hidden md:inline">
          Auto-synced with EVM state
        </span>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Bell className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No alert notifications found</p>
            <p className="text-[11px] text-slate-400">
              {filter === 'unread' ? 'You have read all your real-time alerts.' : 'Notifications will appear here when contract milestones are funded, completed, or disputed.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:px-6 transition-all flex items-start justify-between gap-4 ${
                !n.read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Icon Circle */}
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 shadow-xs ${getNotifBadgeStyle(n.type)}`}>
                  {getNotifIcon(n.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread Alert" />
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      · {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed break-words">
                    {n.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                    {n.contractAddress && (
                      <span>
                        Contract: <strong className="text-slate-700">{n.contractAddress.substring(0, 8)}...{n.contractAddress.substring(36)}</strong>
                      </span>
                    )}
                    {n.amountEth && (
                      <span>
                        Amount: <strong className="text-emerald-700 font-bold">{n.amountEth} ETH</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {n.contractAddress && (
                  <button
                    onClick={() => {
                      evm.markAsRead(n.id);
                      if (n.contractAddress) {
                        onSelectAgreement(n.contractAddress);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Open details for this agreement"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {!n.read ? (
                  <button
                    onClick={() => evm.markAllAsRead(activeAccount.address)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => evm.deleteNotification(n.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
