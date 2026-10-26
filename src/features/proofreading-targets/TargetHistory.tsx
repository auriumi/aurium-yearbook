'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTargetHistory, type History } from './api';

export function TargetHistory({ id, name, onClose }: { id: number; name: string; onClose: () => void }) {
  const [result, setResult] = useState<History | null>(null);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setResult(null); setError('');
    getTargetHistory(id, page, controller.signal).then(r => { if (!controller.signal.aborted) setResult(r); })
      .catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load history.'); });
    return () => controller.abort();
  }, [id, page, retry]);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto bg-white sm:max-w-xl">
    <DialogHeader><DialogTitle>Target change history</DialogTitle><DialogDescription>{name} · Philippine time</DialogDescription></DialogHeader>
    {error ? <div role="alert">{error}<Button variant="outline" onClick={() => setRetry(v => v + 1)}>Retry</Button></div> : !result ? <p role="status">Loading history…</p> : <>
      <ul className="space-y-3">{result.changes.map(c => <li key={c.id} className="rounded-lg border border-stone-200 p-3">
        <p className="font-medium">{c.previous_count ?? 'Not set'} → {c.new_count}</p>
        <p className="mt-1 text-sm text-stone-600">{[c.actor.first_name, c.actor.last_name].filter(Boolean).join(' ') || 'Staff'} · {new Date(c.changed_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
        {c.reason && <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{c.reason}</p>}
      </li>)}</ul>
      {!result.changes.length && <p>No changes recorded.</p>}
      <div className="flex items-center justify-between"><Button variant="outline" disabled={page === 1} onClick={() => setPage(v => v - 1)}>Previous</Button>
        <span className="text-sm">Page {page}</span><Button variant="outline" disabled={page * result.pageSize >= result.total} onClick={() => setPage(v => v + 1)}>Next</Button></div>
    </>}
  </DialogContent></Dialog>;
}
