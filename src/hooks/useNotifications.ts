import { useState, useEffect, useCallback } from "react";
import * as notificationService from "@/app/admin/notificationService";

export function useNotifications(pollMs = 60000) {
  const [items, setItems] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    const res = await notificationService.fetchUnreadCount();
    if (res.success) setUnreadCount(res.count);
  }, []);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    const res = await notificationService.fetchNotifications(1, false);
    if (res.success) {
      setItems(res.data.items ?? []);
      setUnreadCount(res.data.unread ?? 0);
    }
    setIsLoading(false);
  }, []);

  const markOne = useCallback(async (id: number) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    await notificationService.markRead(id);
    refreshCount();
  }, [refreshCount]);

  const markAll = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    await notificationService.markAllRead();
    refreshCount();
  }, [refreshCount]);

  // poll the unread badge on a modest interval
  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, pollMs);
    return () => clearInterval(t);
  }, [refreshCount, pollMs]);

  return { items, unreadCount, isLoading, refreshCount, loadList, markOne, markAll };
}
