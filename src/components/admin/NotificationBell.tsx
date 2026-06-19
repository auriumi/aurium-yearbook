"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2, CheckCircle2, XCircle, MessageSquare, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

const TYPE_ICON: Record<string, { Icon: React.ElementType; color: string }> = {
  IMAGE_UPLOADED: { Icon: Upload, color: "text-amber-600" },
  IMAGE_APPROVED: { Icon: CheckCircle2, color: "text-green-600" },
  IMAGE_REJECTED: { Icon: XCircle, color: "text-red-600" },
  IMAGE_COMMENT: { Icon: MessageSquare, color: "text-blue-600" },
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface NotificationBellProps {
  onNavigate: (tab: string, imageId?: number | null) => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const { items, unreadCount, isLoading, loadList, markOne, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleClick = (n: any) => {
    if (!n.is_read) markOne(n.id);
    if (n.image_id) onNavigate("images-approvals", n.image_id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full text-stone-400 hover:text-amber-800"
        onClick={() => setOpen(o => !o)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl border border-stone-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-bold text-stone-800">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                className="text-[11px] font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-stone-400">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              items.map((n) => {
                const cfg = TYPE_ICON[n.type] ?? TYPE_ICON.IMAGE_COMMENT;
                const { Icon } = cfg;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${n.is_read ? "" : "bg-amber-50/40"}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${cfg.color}`}><Icon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-stone-700 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-stone-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
