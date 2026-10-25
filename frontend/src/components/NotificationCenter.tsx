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
      case 'completed':
      case 'withdrawn':
        return <Coins className="w-4 h-4 text-[#14532D]" />;
      case 'disputed':
      case 'resolved':
        return <ShieldAlert className="w-4 h-4 text-[#991B1B]" />;
      case 'submitted':
      case 'refunded':
      default:
        return <Upload className="w-4 h-4 text-[#111312]" />;
    }
  };

  const getNotifBadgeStyle = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'funded':
      case 'completed':
      case 'withdrawn':
        return 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/25';
      case 'disputed':
      case 'resolved':
        return 'bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/25';
      default:
        return 'bg-[#111312]/5 text-[#111312] border-[#111312]/15';
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-[#111312]/12 shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-[#111312]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#111312] text-white flex items-center justify-center relative shrink-0 shadow-xs">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#991B1B] text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#111312] font-display">
                Real-Time Escrow Activity Alerts
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#14532D] text-white font-bold uppercase tracking-wider">
                Live Signal
              </span>
            </div>
            <p className="text-xs text-[#111312]/60">
              Immediate event notifications when milestones are funded, completed, or disputed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => evm.markAllAsRead(activeAccount.address)}
              className="px-3 py-1.5 rounded-xl bg-[#14532D]/10 hover:bg-[#14532D]/15 text-[#14532D] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#14532D]/25 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-[#F7F8F7] border-b border-[#111312]/10 flex items-center justify-between gap-4 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#111312]/50 shrink-0" />
          <span className="text-[#111312]/60 font-semibold shrink-0">Filter Alerts:</span>

          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#111312] text-white'
                : 'text-[#111312]/70 hover:text-[#111312] hover:bg-white'
            }`}
          >
            All ({accountNotifs.length})
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#111312] text-white'
                : 'text-[#111312]/70 hover:text-[#111312] hover:bg-white'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#991B1B] text-white font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('funded')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filter === 'funded'
                ? 'bg-[#14532D] text-white'
                : 'text-[#111312]/70 hover:text-[#111312] hover:bg-white'
            }`}
          >
            Funded
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#14532D] text-white'
                : 'text-[#111312]/70 hover:text-[#111312] hover:bg-white'
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter('disputed')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filter === 'disputed'
                ? 'bg-[#991B1B] text-white'
                : 'text-[#111312]/70 hover:text-[#111312] hover:bg-white'
            }`}
          >
            Disputed
          </button>
        </div>

        <span className="text-[11px] text-[#111312]/50 font-mono shrink-0 hidden md:inline">
          Auto-synced with EVM state
        </span>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-[#111312]/10 max-h-96 overflow-y-auto">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-[#111312]/60 text-xs space-y-2">
            <Bell className="w-6 h-6 text-[#111312]/30 mx-auto" />
            <p className="font-bold text-[#111312]">No alert notifications found</p>
            <p className="text-[11px] text-[#111312]/50">
              {filter === 'unread'
                ? 'You have read all your real-time alerts.'
                : 'Notifications will appear here when contract milestones are funded, completed, or disputed.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:px-6 transition-all flex items-start justify-between gap-4 ${
                !n.read ? 'bg-[#14532D]/5 hover:bg-[#14532D]/10' : 'hover:bg-[#F7F8F7]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Icon Circle */}
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getNotifBadgeStyle(n.type)}`}>
                  {getNotifIcon(n.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#111312] font-display">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#14532D] shrink-0" title="Unread Alert" />
                    )}
                    <span className="text-[11px] text-[#111312]/50 font-mono">
                      · {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-[#111312]/75 leading-relaxed break-words">
                    {n.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#111312]/60">
                    {n.contractAddress && (
                      <span>
                        Contract: <strong className="text-[#111312]">{n.contractAddress.substring(0, 8)}...{n.contractAddress.substring(36)}</strong>
                      </span>
                    )}
                    {n.amountEth && (
                      <span>
                        Amount: <strong className="text-[#14532D] font-bold">{n.amountEth} ETH</strong>
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
                    className="px-2.5 py-1.5 rounded-lg bg-[#111312] hover:bg-[#222624] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Open details for this agreement"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {!n.read ? (
                  <button
                    onClick={() => evm.markAllAsRead(activeAccount.address)}
                    className="p-1.5 rounded-lg hover:bg-[#111312]/10 text-[#111312]/50 hover:text-[#111312] transition-colors cursor-pointer"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => evm.deleteNotification(n.id)}
                    className="p-1.5 rounded-lg hover:bg-[#991B1B]/10 text-[#111312]/40 hover:text-[#991B1B] transition-colors cursor-pointer"
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
