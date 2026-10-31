'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTargetSchedule, saveTargets, targetRoles, type Cycle, type TargetEntry, type TargetStaff } from './api';

export const targetStaffName = (staff: TargetStaff) => [staff.lastName, staff.firstName].filter(Boolean).join(', ') || `Staff ${staff.id}`;
export function TargetEditor({ cycle, staff, date, today, onClose, onSaved }: {
  cycle: Cycle; staff: TargetStaff[]; date: string; today: string; onClose: () => void; onSaved: () => void;
}) {
  const [count, setCount] = useState(String(staff.length === 1 ? staff[0].target ?? 20 : 20));
  const [dates, setDates] = useState([date]);
  const [extraDate, setExtraDate] = useState('');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<{ entries: TargetEntry[]; operationId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const saving = useRef(false);
  useEffect(() => () => pending.current?.abort(), []);
  const maxDate = new Date(Date.parse(today) + 365 * 86400000).toISOString().slice(0, 10);
  const review = async () => {
    if (busy) return;
    if (!count.trim() || !Number.isSafeInteger(Number(count)) || Number(count) < 0 || Number(count) > 10000 ||
        !dates.length || dates.some(d => d < today || d > maxDate) || staff.length * dates.length > 100) {
      setError('Choose today or future dates, a whole-number target from 0 to 10,000, and at most 100 staff/date combinations.'); return;
    }
    setBusy(true); setError('');
    const controller = new AbortController(); pending.current = controller;
    try {
      const result = await getTargetSchedule(cycle, staff.map(s => s.id), dates, controller.signal);
      if (!controller.signal.aborted) setPreview({ entries: result.entries, operationId: crypto.randomUUID() });
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to prepare targets.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  const save = async () => {
    if (!preview || saving.current) return;
    if (preview.entries.some(e => e.count !== null && e.count !== Number(count)) && !reason.trim()) {
      setError('Give a reason for changing an existing target.'); return;
    }
    saving.current = true; setBusy(true); setError('');
    try {
      await saveTargets(cycle, preview.entries.map(e => ({ ...e, count: Number(count) })), reason.trim(), preview.operationId);
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save.'); }
    finally { saving.current = false; setBusy(false); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white sm:max-w-xl">
      <DialogHeader><DialogTitle>{preview ? 'Review targets' : 'Set daily targets'}</DialogTitle>
        <DialogDescription>{staff.length} staff · {targetRoles[cycle.role ?? 'INFORMATION_PROOFREADER']} · {cycle.year} {cycle.term === 'END_YEAR' ? 'End year' : 'Mid year'}</DialogDescription></DialogHeader>
      {!preview ? <fieldset disabled={busy} className="space-y-4">
        <p className="text-sm text-stone-600">{staff.map(targetStaffName).join('; ')}</p>
        <label className="block space-y-2 text-sm font-medium">Target for each person, each selected day
          <Input type="number" min={0} max={10000} step={1} value={count} onChange={e => setCount(e.target.value)} /></label>
        <p className="text-sm text-stone-600">Use 0 for no new target. Staff can continue after reaching a target.</p>
        <div className="flex flex-wrap gap-2" aria-label="Selected working dates">{dates.map(d => <Button key={d} variant="outline" onClick={() => setDates(list => list.filter(value => value !== d))} aria-label={`Remove ${d}`}>{d} ×</Button>)}</div>
        <div className="flex items-end gap-2"><label className="flex-1 space-y-2 text-sm font-medium">Add a working date<Input type="date" min={today} max={maxDate} value={extraDate} onChange={e => setExtraDate(e.target.value)} /></label>
          <Button variant="outline" disabled={!extraDate || dates.includes(extraDate) || extraDate < today || extraDate > maxDate} onClick={() => { setDates(list => [...list, extraDate].sort()); setExtraDate(''); }}>Add date</Button></div>
        <label className="block space-y-2 text-sm font-medium">Reason <span className="font-normal text-stone-500">(required for changes)</span>
          <textarea className="min-h-20 w-full rounded-lg border border-stone-300 p-3" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>
      </fieldset> : <div className="space-y-3">
        <p className="font-medium text-stone-900">{Number(count)} each · {staff.length} staff · {dates.length} selected day{dates.length === 1 ? '' : 's'}</p>
        <ul className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3 text-sm">{preview.entries.map(e => <li key={`${e.staffId}/${e.date}`}>
          {targetStaffName(staff.find(s => s.id === e.staffId)!)} · {e.date}: {e.count ?? 'Not set'} → {Number(count)}
        </li>)}</ul>
        {reason && <p className="text-sm text-stone-600">Reason: {reason}</p>}
        <p className="text-sm text-stone-600">Existing backlog remains. Today’s remaining work will be recalculated.</p>
      </div>}
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => preview ? (setPreview(null), setError('')) : onClose()}>{preview ? 'Back / refresh preview' : 'Cancel'}</Button>
        <Button className="bg-amber-900 text-white hover:bg-amber-800" disabled={busy} onClick={preview ? save : review}>{busy ? 'Please wait…' : preview ? 'Save targets' : 'Review targets'}</Button></div>
    </DialogContent>
  </Dialog>;
}
